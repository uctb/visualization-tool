import argparse
import json
import os
import pickle
import numpy as np
import pandas as pd

parser = argparse.ArgumentParser(description='arguments')
parser.add_argument('--data_dir', default='METR_LA_pred.pkl', type=str)
parser.add_argument('--adj', default='adj.pkl', type=str)

args = parser.parse_args()

def generate_exp_file():
    """
    Load data and adjacency matrix from specified pickle files and generate a JSON file.
    """
    # Open and load the data file
    with open(args.data_dir, 'rb') as f:
        data = pickle.load(f)
    # Open and load the adjacency matrix file
    with open(args.adj, 'rb') as f:
        adj = pickle.load(f)

    # Get the dataset name (without extension)
    base_name = os.path.basename(args.data_dir)
    file_name_without_extension = base_name[:-8]

    # Generate JSON file
    dataset_option = list(data["Pred"].keys())[0]
    gt_list = data["Pred"][dataset_option]["GroundTruth"]
    pd_list = data["Pred"][dataset_option]["stgcn"]["TrafficNode"]
    station_info = data["Node"]["StationInfo"]

    gt_df = gt_list.transpose()
    pd_df = pd_list.transpose()
    
    station_info_df = pd.DataFrame(station_info)
    station_info_df = station_info_df.drop(station_info_df.columns[[0, 1, 4]], axis=1)

    combined_data = {
        "groudTruth": gt_df.tolist(),
        "prediction": pd_df.tolist(),
        "stationInfo": station_info_df.values.tolist(),
        "graph": np.reshape(adj,(adj.shape[-1],adj.shape[-1])).tolist()
    }

    try:
        json_path = '../tsv/' + file_name_without_extension + '.json'
        
        with open(json_path, 'w') as json_file:
            json.dump(combined_data, json_file, indent=4)
        
        print("success!")
    except Exception as e:
        print("fail:", e)


if __name__ == "__main__":
    generate_exp_file()