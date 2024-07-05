import argparse
import os
import pickle
import json
import contextlib
from sklearn.metrics import calinski_harabasz_score
import numpy as np
import pandas as pd
import statsmodels.api as sm
from tslearn.clustering import KShape
from tslearn.metrics import cdist_dtw
from sklearn.cluster import SpectralClustering
from statsmodels.tsa.stattools import cal_granger_gausalitytests

parser = argparse.ArgumentParser(description='arguments')
parser.add_argument('--data_dir', default='METR_LA.pkl', type=str)
parser.add_argument('--pred_dir', default='METR_LA_pred.pkl', type=str)
parser.add_argument('--adj_file',default='adj.pkl', type=str)
parser.add_argument('--output_dir', default='result.json', type=str)
parser.add_argument('--K_cluster', default=4, type=int)
parser.add_argument('--N_cluster', default=2, type=int)
parser.add_argument('--spatial_cluster', default=20, type=int)
parser.add_argument("--test_ratio", default=0.2, type=float)
parser.add_argument("--MergeIndex", default=12, type=int)
parser.add_argument("--MergeWay", default="average", type=str)

args = parser.parse_args()

def add_object_to_json(file_path, key, new_object):
    """
    Adds a new object to a JSON file under a specified key.

    Args:
    file_path (str): The path to the JSON file.
    key (str): The key under which the new object will be added.
    new_object (dict): The object to be added to the JSON file.

    Raises:
    ValueError: If the root of the JSON file is not a dictionary.
    """
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    
    if not isinstance(data, dict):
        raise ValueError("The root of the JSON file should be an object (dictionary).")
    
    data[key] = new_object
    
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=4)
        
def merge_data(data, MergeIndex, MergeWay):
    """
    Merges rows of a 2D numpy array based on the specified merging method.

    Args:
    data (numpy.ndarray): The input 2D numpy array to be merged.
    MergeIndex (int): The number of rows to merge together.
    MergeWay (str): The method to merge the rows. Can be "sum", "average", or "max".

    Returns:
    numpy.ndarray: A new 2D numpy array with merged rows.

    Raises:
    ValueError: If MergeWay is not "sum", "average", or "max".
    """
    if MergeWay == "sum":
        func = np.sum
    elif MergeWay == "average":
        func = np.mean
    elif MergeWay == "max":
        func = np.max
    else:
        raise ValueError("Parameter MergeWay should be 'sum', 'average', or 'max'")
        
    valid_row_count = data.shape[0] // MergeIndex
    
    new = np.zeros((valid_row_count, data.shape[1]), dtype=np.float32)
    for new_ind, ind in enumerate(range(0, valid_row_count * MergeIndex, MergeIndex)):
        new[new_ind, :] = func(data[ind:ind + MergeIndex, :], axis=0)
    return new

def normalized_laplacian_matrix(adj):
    """
    Computes the normalized Laplacian matrix of a given adjacency matrix.

    Args:
    adj (numpy.ndarray): The adjacency matrix of the graph.

    Returns:
    numpy.ndarray: The normalized Laplacian matrix.
    """
    D = np.diag(np.sum(adj, axis=1))  # Degree matrix
    L = D - adj  # Laplacian matrix
    
    with np.errstate(divide='ignore', invalid='ignore'):
        D_inv_sqrt = np.diag(1.0 / np.sqrt(np.diag(D)))
        D_inv_sqrt[np.isinf(D_inv_sqrt)] = 0  # Set elements with zero degree to zero
    
    L_normalized = np.dot(np.dot(D_inv_sqrt, L), D_inv_sqrt)
    return L_normalized
    
def calculate_aic(df, max_lag):
    """
    Calculate the Akaike Information Criterion (AIC) for a range of lag values in a VAR model.

    Args:
    df (pandas.DataFrame): The input time series data.
    max_lag (int): The maximum lag value to consider.

    Returns:
    list: A list of AIC values corresponding to each lag from 1 to max_lag.
    """
    aic_values = []
    for lag in range(1, max_lag + 1):
        model = sm.tsa.VAR(df).fit(lag)
        aic_values.append(model.aic)
    return aic_values

def granger_causality_test(df, best_lag):
    """
    Perform the Granger causality test on the given DataFrame with the specified lag.

    Args:
    df (pandas.DataFrame): The input time series data.
    best_lag (int): The lag value to use for the Granger causality test.

    Returns:
    float: The F-value if the p-value is less than or equal to 0.005, otherwise returns 0.
    """
    with contextlib.redirect_stdout(open(os.devnull, 'w')):
        test_result = cal_granger_gausalitytests(df, best_lag, verbose=False)
    p_value = test_result[best_lag][0]['ssr_ftest'][1]
    f_value = test_result[best_lag][0]['ssr_ftest'][0]
    return f_value if p_value <= 0.005 else 0

def find_best_lag(aic_values):
    return aic_values.index(min(aic_values)) + 1

def reconstruction_loss(A_o, A_o_hat):
    N_o = A_o.shape[0]
    A_o_hat = np.clip(A_o_hat, 1e-10, 1 - 1e-10)
    
    if np.array_equal(A_o, A_o.astype(bool)):
        W = np.ones_like(A_o)
    else:
        W = A_o  
    loss = -(W * (A_o * np.log(A_o_hat) + (1 - A_o) * np.log(1 - A_o_hat)))
    return np.sum(loss) / (N_o * N_o)

def generate_temporal_cluster(data):
    # Merge every 24 hours or every 12*24 hours based on MergeIndex
    if args.MergeIndex == 12:
        merge_data = merge_data(data, 24, args.MergeWay)  
    else:
        merge_data = merge_data(data, 24 * 12, args.MergeWay)       
    
    # Transpose data to fit the traffic pattern analysis for stations
    data_tslearn = merge_data.T.reshape((merge_data.shape[1], merge_data.shape[0], 1))
    ks = KShape(n_clusters=args.K_cluster, random_state=0)
    y_pred_kshape = ks.fit_predict(data_tslearn)

    unique_clusters = np.unique(y_pred_kshape)
    if len(unique_clusters) != args.K_cluster:
        # If K-Shape clustering does not produce the expected number of clusters, use DTW and Spectral Clustering
        dtw_matrix = cdist_dtw(data_tslearn)

        spectral_clustering = SpectralClustering(n_clusters=args.N_cluster * args.K_cluster,
                                                affinity='precomputed',
                                                random_state=0)
        y_pred_spectral = spectral_clustering.fit_predict(dtw_matrix)

        final_labels = y_pred_spectral  
    else:
        # Create a dictionary to store station indices for each K-Shape cluster
        clusters_kshape = {i: np.where(y_pred_kshape == i)[0] for i in range(args.K_cluster)}
        print(y_pred_kshape)
        final_labels = np.zeros(data.shape[1], dtype=int)  

        current_label = 0
        for _, cluster_indices in clusters_kshape.items():
            cluster_data = data_tslearn[cluster_indices]
            dtw_matrix = cdist_dtw(cluster_data)

            spectral_clustering = SpectralClustering(n_clusters=args.N_cluster,
                                                    affinity='precomputed',
                                                    random_state=0)
            y_pred_spectral = spectral_clustering.fit_predict(dtw_matrix)
            
            for i, idx in enumerate(cluster_indices):
                final_labels[idx] = current_label + y_pred_spectral[i]

            current_label += args.N_cluster

    result = {
        'generate_temporal_cluster': final_labels.tolist()
    }
    with open(args.output_dir, 'w') as f:
        json.dump(result, f)
        
def generate_spatial_cluster(adj, data):
    if args.MergeIndex == 12:
        merge_data = merge_data(data, 24, args.MergeWay)  
    else:
        merge_data = merge_data(data, 24 * 12, args.MergeWay)
        
    # shape = (num_nodes, num_time_steps, num_features)
    data_tslearn = merge_data.T.reshape((merge_data.shape[1], merge_data.shape[0], 1))
    
    adj = np.reshape(adj,(adj.shape[-1],adj.shape[-1]))
    
    is_binary = np.array_equal(adj, adj.astype(bool))  
    
    if not is_binary:
        adj = adj / np.max(adj)
        
    laplacian_matrix = normalized_laplacian_matrix(adj)
    spectral_clustering = SpectralClustering(n_clusters=args.spatial_cluster,
                                                 random_state=0)
    y_pred_spectral = spectral_clustering.fit_predict(laplacian_matrix)
    
    # Construct the mapping matrix M_or
    N_o = data_tslearn.shape[0]
    M_or = np.zeros((N_o, args.spatial_cluster))
    for i in range(N_o):
        M_or[i, y_pred_spectral[i]] = adj[i, y_pred_spectral[i]]
    # Normalize each column to sum to 1
    M_or = M_or / np.sum(M_or, axis=0, keepdims=True)

    # Generate the feature and adjacency matrix for the regional graph
    H_r = M_or.T @ data_tslearn.reshape((N_o, -1))
    
    H_r_reconstructed = M_or @ H_r
    A_o_hat = np.dot(H_r_reconstructed, H_r_reconstructed.T)
    A_o_hat = 1 / (1 + np.exp(-A_o_hat))    
    
    loss = reconstruction_loss(adj, A_o_hat, is_binary)
    print("Reconstruction Loss:", loss)
    
    ch_score = calinski_harabasz_score(laplacian_matrix, y_pred_spectral)
    print("Calinski-Harabasz Score:", ch_score)
    
    add_object_to_json(args.output_dir, 'generate_spatial_cluster', y_pred_spectral.tolist())

def cal_granger_gausality(data):
    df = pd.DataFrame(data)
    max_lag = 3
    
    granger_results = []
    for i in range(df.shape[1]):
        results_list = []
        for j in range(df.shape[1]):
            if i != j:
                pair_df = df.iloc[:, [j, i]]
                aic_values = calculate_aic(pair_df, max_lag)
                best_lag = find_best_lag(aic_values)
                causality_results = granger_causality_test(pair_df, best_lag)
                if causality_results != 0:
                    results_list.append((causality_results, j, best_lag))
        results_list.sort(reverse=True, key=lambda x: x[0])
        top_10_results = results_list[:10]
        granger_results.append(top_10_results)
    add_object_to_json(args.output_dir, 'granger', granger_results) 
    
def cal_pearson_correlation(data):
    dataset_option = list(data["Pred"].keys())[0]
    gt_list = data["Pred"][dataset_option]["GroundTruth"]
    pd_list = data["Pred"][dataset_option]["stmeta"]["TrafficNode"]
    gt_df = pd.DataFrame(gt_list)
    pd_df = pd.DataFrame(pd_list)
    
    corr_matrix_gt = gt_df.corr()
    corr_matrix_pd = pd_df.corr()
    
    corr_values_gt = corr_matrix_gt.values[np.triu_indices_from(corr_matrix_gt, k=1)]
    corr_values_pd = corr_matrix_pd.values[np.triu_indices_from(corr_matrix_pd, k=1)]
    
    bins = np.arange(0, 1.1, 0.1)
    hist_gt, _ = np.histogram(corr_values_gt, bins=bins)
    hist_pd, _ = np.histogram(corr_values_pd, bins=bins)
    
    data_to_add = np.vstack((hist_gt, hist_pd)).tolist()
    
    add_object_to_json(args.output_dir, 'pearson', data_to_add)
    
    
if __name__ == '__main__':
    with open(args.data_dir, 'rb') as f:
        data = pickle.load(f)
    data = merge_data(data['Node']['TrafficNode'], args.MergeIndex, args.MergeWay)
    data = data[0:int(data.shape[0] * (1 - args.test_ratio)), :]
    
    with open(args.pred_dir, 'rb') as f:
        pred = pickle.load(f)
        
    with open(args.adj_file, 'rb') as f:
        adj = pickle.load(f)
        
    generate_temporal_cluster(data)
    generate_spatial_cluster(adj, data)
    cal_granger_gausality(data)
    cal_pearson_correlation(pred)
    