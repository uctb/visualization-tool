# ErrorDiagnosisTool

we have developed a tool that integrates visualization, error localization, and error diagnosis. Specifically, it allows data to be uploaded, and provides interactive visual charts to show model errors, combined with spatiotemporal knowledge for error diagnosis

Welcome to visit http://39.107.116.221/  for a trial!



## Deployment

Deployment requires the following environment:

- node == 16.14.0
- npm == 8.3.1



### 1. Install dependencies

```
npm install
```

### 2. Start
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



## Manual

<img src="/Users/hyymmmint/Documents/XMU/project/uctb-web/figure/process.png" alt="process" style="zoom:67%;" />

### 1. Load Data

You can use a predefined dataset or upload your own data in the data loader panel,  where the ground truth and prediction value are mandatory, spatial information (Geographical Coordinates) and time information (Time Range, Time Fitness) are optional. The data requirement is a tsv file.
*Tips: The more data you provide, the more functions you can use!*



### 2. Locate Error

You can view model errors in the Error Visualization panel. The panel is divided into three parts from top to bottom, showing the overall error of the model, spatial bad case and temporal bad case. To find specific areas where the model performs poorly, we strongly recommend following our proposed two-step analysis strategy. First, observe from the spatial dimension to locate spatial bad cases, and then observe from the time dimension at the station level to locate temporal bad cases.



### 3. Diagnose Error

You can perform error diagnosis in the error diagnosis panel. By addressing the following two research questions, you can better understand the error patterns.

*RQ1: Is the distribution of spatial bad cases related to station attributes?*

*RQ2: Is the distribution of temporal bad cases realted to time characteristics?*

The answers to these questions will provide you with valuable insights and suggestions for improving your model.







