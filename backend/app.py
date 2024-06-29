import os
from flask import Flask, request, jsonify
from flask_cors import *
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores.faiss import FAISS

os.environ["OPENAI_API_KEY"] = ''
os.environ['OPENAI_API_BASE'] = ''
model = ChatOpenAI(model="gpt-3.5-turbo-0125")
app = Flask(__name__)
CORS(app, supports_credentials=True)
config = {"configurable": {"session_id": "abc2"}}

def retrieval(query):
    """
    Retrieval function to fetch relevant documents from the vector store based on the query and generate a prompt.

    Args:
    query (str): The user's query string.

    Returns:
    str: A prompt string containing the query and relevant document content.
    """
    embedding_path = './all-mpnet-base-v2'
    embedding_model = HuggingFaceEmbeddings(model_name=embedding_path)
    
    # Load vector store from local storage, allowing dangerous deserialization
    vectorstore = FAISS.load_local('./vectorstore.index', embeddings=embedding_model, 
                                   index_name='index', allow_dangerous_deserialization=True)
    
    # Perform similarity search to get relevant documents with scores
    docs = vectorstore.similarity_search_with_score(query, k=2)
    
    # Generate base prompt with the query and relevant document content
    base_prompt = f'需要解决的问题是：{query}, 以下是相关信息：\n'
    for doc, _ in docs:
        base_prompt += doc.page_content + '\n'
        
    return base_prompt


@app.route('/chat', methods=['POST'])
def chat():
    query = request.form.get('query')
    is_rag = request.form.get('is_rag')
    
    if is_rag == 'true':
        prompt = retrieval(query)
    else:
        prompt = query
    
    system_template = "假如你是一名时空预测领域的时空图建模专家，请为时空图建模问题提供改进手段："
    prompt_template = ChatPromptTemplate.from_messages([
        ('system', system_template),
        ('user','{query}')
    ])
    parser = StrOutputParser()
    chain = prompt_template | model | parser

    return jsonify({'resp': chain.invoke({'query':prompt}, config=config)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8888, debug=True)
