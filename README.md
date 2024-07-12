# STErrorCopilot

We propose STErrorCopilot, which combines a series of automated methods and large models to provide multi-angle and multi-level error analysis support for error analysis through various forms such as maps, line charts, histograms, and scatter plots. Based on the methods of time clustering, spatial clustering and error screening, the prediction performance and shortcomings of the model can be fully understood, and large model dialogue based on RAG is provided to further reduce the difficulty of error analysis and model tuning.

## Deployment

### frontend
Deployment requires the following environment:

- node == 16.14.0
- npm == 8.3.1

#### 1. Install dependencies

```
npm install
```

#### 2. Start
```
npm run serve
```

Then you will see the following prompt on the screen:

```
 App running at:
  - Local:   http://localhost:xxxx/ 
  - Network: http://ip:xxxx/
```

You can use the tool by visiting the URL above.

### backend

- environment_3.9.yml 
- environment_3.6.yml (PS: The environment_3.6.yml is uesd for backend/generateAuFile.py.)

## Manual

### 1. Load Data

You can upload your own data in the data loader panel. The data requirement is a JSON file, and you can obtain the data by using the generateAuFile.py and generateExpFile.py in the backend folder.

### 2. Diagnose Error

You can perform error diagnosis in the error diagnosis panel. By addressing the following four research questions, you can better understand the error patterns.

*Q1: When and where does the model produce inaccurate predictions?*

*Q2: Do the inaccuracies stem from the modeling level or the semantic information level?*

*Q3: What factors contribute to inaccuracies at this level?*

*Q4: How can the model’s performance be improved based on the insights gained?*

The answers to these questions will provide you with valuable insights and suggestions for improving your model.







