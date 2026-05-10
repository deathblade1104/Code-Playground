# -*- coding: utf-8 -*-
"""
Created on Wed Mar 18 00:23:28 2020

@author: KIIT
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

#importing dataset
dataset=pd.read_csv('FuelConsumptionCo2.csv')

#selecting required columns
dataset=dataset.drop(['VEHICLECLASS','TRANSMISSION','FUELCONSUMPTION_CITY',
                      'FUELCONSUMPTION_HWY','FUELCONSUMPTION_COMB_MPG','MODELYEAR',
                      'MAKE','MODEL'],axis='columns')

#dealing with categorical data and escaping dummy variable trap
dummy=pd.get_dummies(dataset.FUELTYPE)
merged=pd.concat([dummy,dataset],axis='columns')
final=merged.drop(['FUELTYPE','D'],axis='columns')

#checking whether dataset contains null value
final.isnull()

#creating independent and dependent variable array
x=final.iloc[:,:-1].values
y=final.iloc[:,-1].values

#using backward elimination to remove unrequired variables
x=np.append(arr=np.ones((1067,1)).astype(int),values=x,axis=1)

import statsmodels.api as sm
x_opt=x[:,:]
regressor_ols=sm.OLS(y,x_opt).fit()
regressor_ols.summary()

#since all values are above significance level none will be removed

#splitting data into test set and train set
from sklearn.model_selection import train_test_split
x_train,x_test,y_train,y_test=train_test_split(x,y,test_size=0.2,random_state=0)


#training model
from sklearn.linear_model import LinearRegression
regressor=LinearRegression()
regressor.fit(x_train,y_train)
print('Model Score : '+str(regressor.score(x_test,y_test)))

#predicting values
y_pred=regressor.predict(x_test)

print('Mean Absolute Error :',np.mean(abs(y_pred - y_test)))
print('Mean Squared Error :',np.mean((y_pred - y_test)**2))
print('Root Mean Squared Error :',(np.mean((y_pred - y_test)**2))**0.5)




