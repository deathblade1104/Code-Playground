"""
Customer Churn Prediction
==========================
A machine learning project that predicts whether a customer will churn from a telecom company.
Uses multiple classification algorithms including KNN, SVM, Decision Tree, Random Forest, and CatBoost.

Dataset: Churn.csv - Telecom customer data with demographic and service information
"""

# Import necessary libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from catboost import CatBoostClassifier
from sklearn.metrics import roc_auc_score
from sklearn.decomposition import PCA
from mpl_toolkits import mplot3d
import matplotlib.pyplot as plt

# Load the dataset
print("Loading dataset...")
dataset = pd.read_csv("Churn.csv")

# Drop customer ID as it's not useful for prediction
dataset = dataset.drop(['customerID'], axis=1)

# Display data types
print("\nData types:")
print(dataset.dtypes)

# Data preprocessing: Fix TotalCharges column
# Replace empty strings with NaN and convert to numeric
dataset['TotalCharges'] = dataset['TotalCharges'].replace([' '], '')
dataset[['TotalCharges']] = dataset[['TotalCharges']].apply(pd.to_numeric)

print("\nAfter conversion:")
print(dataset.dtypes)
print(dataset.info)
print("\nMissing values:")
print(dataset.isnull().sum())

# Remove rows with missing values
dataset.dropna(inplace=True)
print("\nAfter removing missing values:")
print(dataset.isnull().sum())

# =============================================================================
# EXPLORATORY DATA ANALYSIS
# =============================================================================
print("\n\n==================== EXPLORATORY DATA ANALYSIS ====================")

# Analyze target variable distribution
print('\nTarget Variable Distribution:')
print(dataset.groupby(['Churn']).Churn.count())

# Visualize target variable
sns.set_style('darkgrid')
plt.figure(figsize=(10, 5))
sns.countplot(dataset['Churn'], alpha=.80, palette=['grey', 'lightgreen'])
plt.title('Non_Churning vs Churning')
plt.ylabel('Customers')
plt.show()

# Key insight: High class imbalance (5163 No vs 1869 Yes)

# Analyze categorical variables and their relationship with churn
print("\nAnalyzing PhoneService vs Churn...")
ps = dataset.groupby(['PhoneService', 'Churn']).PhoneService.count().unstack()
p1 = ps.plot(kind='bar', stacked=True,
             title='PhoneService : Not_Churning vs Churning',
             color=['grey', 'lightgreen'], alpha=.70)
p1.set_xlabel('Phone Service')
p1.set_ylabel('Customers')
p1.legend(['Non_Churning', 'Churning'])
plt.show()

# Insight: More customers who had Phone Service decided to churn

print("\nAnalyzing Contract vs Churn...")
ps = dataset.groupby(['Contract', 'Churn']).Contract.count().unstack()
p1 = ps.plot(kind='bar', stacked=True,
             title='Contract : Not_Churning vs Churning',
             color=['grey', 'lightgreen'], alpha=.70)
p1.set_xlabel('Contract')
p1.set_ylabel('Customers')
p1.legend(['Non_Churning', 'Churning'])
plt.show()

# Insight: Most people who churned had Month-to-Month subscription

print("\nAnalyzing PaymentMethod vs Churn...")
ps = dataset.groupby(['PaymentMethod', 'Churn']).PaymentMethod.count().unstack()
p1 = ps.plot(kind='bar', stacked=True,
             title='PaymentMethod : Not_Churning vs Churning',
             color=['grey', 'lightgreen'], alpha=.70)
p1.set_xlabel('PaymentMethod')
p1.set_ylabel('Customers')
p1.legend(['Non_Churning', 'Churning'])
plt.show()

# Insight: Customers using Electronic Check were more likely to churn

print("\nAnalyzing SeniorCitizen vs Churn...")
ps = dataset.groupby(['SeniorCitizen', 'Churn']).SeniorCitizen.count().unstack()
p1 = ps.plot(kind='bar', stacked=True,
             title='SeniorCitizen: Not_Churning vs Churning',
             color=['grey', 'lightgreen'], alpha=.70)
p1.set_xlabel('SeniorCitizen')
p1.set_ylabel('Customers')
p1.legend(['Non_Churning', 'Churning'])
plt.show()

# Insight: Younger citizens were more likely to churn

print("\nAnalyzing InternetService vs Churn...")
ps = dataset.groupby(['InternetService', 'Churn']).InternetService.count().unstack()
p1 = ps.plot(kind='bar', stacked=True,
             title='Internet Service : Not_Churning vs Churning',
             color=['grey', 'lightgreen'], alpha=.70)
p1.set_xlabel('Internet Service')
p1.set_ylabel('Customers')
p1.legend(['Non_Churning', 'Churning'])
plt.show()

# Insight: Most churned customers used Fibre Optics
# Customers without internet connection didn't churn much

# Analyze tenure by internet service and churn
sns.barplot(x='InternetService', y='tenure', hue='Churn', data=dataset, palette=['grey', 'lightgreen'])
plt.xlabel('Internet Service Plan')
plt.xticks(rotation=90)
plt.title('Tenure for the provider')
plt.show()

# Analyze tenure distribution
print("\nAnalyzing tenure distribution...")
churn_yes = dataset[dataset['Churn'] == "Yes"]
churn_no = dataset[dataset['Churn'] == "No"]
sns.distplot(churn_no.tenure, label='Non_Churning', color='grey')
sns.distplot(churn_yes.tenure, label='Churning', color='lightgreen')
plt.legend(title='Churn', loc='best')
plt.show()

# Insight: Customers with lower tenure are more likely to churn

# Analyze monthly charges distribution
print("\nAnalyzing monthly charges distribution...")
sns.distplot(churn_no.MonthlyCharges, label='Non_Churning', color='grey')
sns.distplot(churn_yes.MonthlyCharges, label='Churning', color='lightgreen')
plt.legend(title='Churn', loc='best')
plt.show()

# Insight: Customers with monthly charges between 60-100 were more likely to churn
# Customers with monthly charges < 20 were less likely to churn

# =============================================================================
# DATA PREPARATION FOR MODELING
# =============================================================================

# Convert categorical variables to dummy variables
print("\n\n=============== DATA PREPARATION ===============")
categorical = list(dataset.select_dtypes(include=['object']))
dummy = pd.get_dummies(dataset[categorical], drop_first=True)
merged = pd.concat([dataset, dummy], axis='columns')
final = merged.drop(merged[categorical], axis='columns')

# Generate correlation heatmap
print("\nGenerating correlation heatmap...")
corr = final.corr()
plt.figure(figsize=(22, 22))
ax = sns.heatmap(corr, annot=True, linewidth=.5, fmt='0.1f',
                 vmin=-1, vmax=1, cmap="coolwarm")
plt.show()

# Split data into train and test sets
print("\nSplitting data into train and test sets...")
x_train, x_test, y_train, y_test = train_test_split(
    final.iloc[:, :-1], final.iloc[:, -1],
    stratify=final.iloc[:, -1], test_size=0.2, random_state=0
)

# =============================================================================
# FEATURE SELECTION
# =============================================================================
print("\n\n================ FEATURE SELECTION ================")
print("Analyzing feature importance using ROC scores...")

x_train = pd.DataFrame(x_train)
roc_values = []

# Calculate ROC score for each feature individually
for feature in x_train.columns:
    clf = DecisionTreeClassifier()
    clf.fit(np.array(x_train[feature]).reshape(-1, 1), y_train)
    y_scored = clf.predict_proba(x_test[feature].to_frame())
    roc_values.append(roc_auc_score(y_test, y_scored[:, 1]))

# Display feature importance
roc_values = pd.Series(roc_values)
roc_values.index = x_train.columns
print("\nROC scores by feature:")
print(roc_values.sort_values(ascending=False))

# Visualize feature importance
roc_values.sort_values(ascending=False).plot.bar(figsize=(20, 8))
plt.show()

# Remove gender feature as it has ROC < 0.5 (worse than random)
print("\nRemoving gender_Male feature (ROC < 0.5)...")
x_train.drop(['gender_Male'], axis=1, inplace=True)
x_test.drop(['gender_Male'], axis=1, inplace=True)

# Prepare feature and target lists
features = list(x_train.columns)
target = ("0", "1")

# Standardize features
print("\nStandardizing features...")
sc = StandardScaler()
x_train = sc.fit_transform(x_train)
x_test = sc.transform(x_test)

# =============================================================================
# MODEL BUILDING - K Nearest Neighbours
# =============================================================================
print("\n\n========== K Nearest Neighbours ==========")

# Create and train KNN model
classifier_knn = KNeighborsClassifier(n_neighbors=21, p=2)
classifier_knn.fit(x_train, y_train)

# Make predictions
y_pred_knn = classifier_knn.predict(x_test)
y_trpr_knn = classifier_knn.predict(x_train)

# Evaluate model
print("TRAIN SET ACCURACY =", accuracy_score(y_train, y_trpr_knn))
print("TEST SET ACCURACY =", accuracy_score(y_test, y_pred_knn))

# Detailed classification report
print("\n_________________TRAIN SET KNN__________________")
cm = confusion_matrix(y_train, y_trpr_knn)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_train, y_trpr_knn))

print("\n_________________TEST SET KNN__________________")
cm = confusion_matrix(y_test, y_pred_knn)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_test, y_pred_knn))

# =============================================================================
# MODEL BUILDING - Support Vector Machines
# =============================================================================
print("\n\n========== Kernelized SVM ==========")

# Create and train SVM model
classifier_svc = SVC(kernel='rbf', C=0.1, gamma=0.1, random_state=0,
                     probability=True)
classifier_svc.fit(x_train, y_train)

# Make predictions
y_pred_svc = classifier_svc.predict(x_test)
y_trpr_svc = classifier_svc.predict(x_train)

# Evaluate model
print("TRAIN SET ACCURACY =", accuracy_score(y_train, y_trpr_svc))
print("TEST SET ACCURACY =", accuracy_score(y_test, y_pred_svc))

# Detailed classification report
print("\n_________________TRAIN SET SVM__________________")
cm = confusion_matrix(y_train, y_trpr_svc)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_train, y_trpr_svc))

print("\n_________________TEST SET SVM__________________")
cm = confusion_matrix(y_test, y_pred_svc)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_test, y_pred_svc))

# =============================================================================
# MODEL BUILDING - Decision Tree
# =============================================================================
print("\n\n========== Decision Tree ==========")

# Create and train Decision Tree model
classifier_dt = DecisionTreeClassifier(criterion='gini', max_depth=4)
classifier_dt.fit(x_train, y_train)

# Make predictions
y_pred_dt = classifier_dt.predict(x_test)
y_trpr_dt = classifier_dt.predict(x_train)

# Evaluate model
print("TRAIN SET ACCURACY =", accuracy_score(y_train, y_trpr_dt))
print("TEST SET ACCURACY =", accuracy_score(y_test, y_pred_dt))

# Detailed classification report
print("\n_________________TRAIN SET DTree__________________")
cm = confusion_matrix(y_train, y_trpr_dt)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_train, y_trpr_dt))

print("\n_________________TEST SET DTree__________________")
cm = confusion_matrix(y_test, y_pred_dt)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_test, y_pred_dt))

# =============================================================================
# MODEL BUILDING - Random Forest
# =============================================================================
print("\n\n========== Random Forest ==========")

# Create and train Random Forest model
classifier_rf = RandomForestClassifier(criterion='gini', bootstrap=True,
                                       random_state=0,
                                       n_estimators=25, max_depth=6)
classifier_rf.fit(x_train, y_train)

# Make predictions
y_pred_rf = classifier_rf.predict(x_test)
y_trpr_rf = classifier_rf.predict(x_train)

# Evaluate model
print("TRAIN SET ACCURACY =", accuracy_score(y_train, y_trpr_rf))
print("TEST SET ACCURACY =", accuracy_score(y_test, y_pred_rf))

# Detailed classification report
print("\n_________________TRAIN SET RandomForest__________________")
cm = confusion_matrix(y_train, y_trpr_rf)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_train, y_trpr_rf))

print("\n_________________TEST SET RandomForest__________________")
cm = confusion_matrix(y_test, y_pred_rf)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.show()
print(classification_report(y_test, y_pred_rf))

# =============================================================================
# MODEL BUILDING - CatBoost
# =============================================================================
print("\n\n========== CatBoost ==========")
print("Using CatBoost for categorical variables...")

# Prepare data for CatBoost (keeping original categorical features)
dataset['Churn'] = final['Churn_Yes']
dataset_clean = dataset.drop(['gender'], axis=1)

# Split into train and test
x_train_cat, x_test_cat, y_train_cat, y_test_cat = train_test_split(
    dataset_clean.iloc[:, :-1], dataset_clean.iloc[:, -1],
    test_size=0.2, random_state=0
)

# Get categorical feature indices (excluding 'Churn')
categorical_features = [i for i, col in enumerate(x_train_cat.columns)
                        if x_train_cat[col].dtype == 'object']

# Create and train CatBoost model
classifier_cat = CatBoostClassifier(iterations=2500,
                                    learning_rate=0.005,
                                    l2_leaf_reg=0.05,
                                    depth=5,
                                    verbose=False)

classifier_cat.fit(x_train_cat, y_train_cat, cat_features=categorical_features)
y_pred_cat = classifier_cat.predict(x_test_cat)

# Evaluate model
print("\n_________________TRAIN SET CatBoost__________________")
y_pred_train_cat = classifier_cat.predict(x_train_cat)
print(classification_report(y_train_cat, y_pred_train_cat))

print("\n_________________TEST SET CatBoost__________________")
cm = confusion_matrix(y_test_cat, y_pred_cat)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0', 'Predicted:1'],
                          index=['Actual:0', 'Actual:1'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
print(classification_report(y_test_cat, y_pred_cat))

# =============================================================================
# VISUALIZATION WITH PCA
# =============================================================================
print("\n\n========== PCA Visualization ==========")

# Apply PCA for dimensionality reduction
pca = PCA(n_components=3)
pca.fit(x_train)
x = pca.transform(x_test)
comb = pd.DataFrame(x, columns=['0', '1', '2'])

# Visualize test set
comb = np.array(comb)
fig = plt.figure(figsize=(10, 10))
ax = plt.axes(projection='3d')
ax.scatter(comb[:, 0], comb[:, 1], comb[:, 2], c=y_test, marker='x',
           cmap='coolwarm', linewidth=1)
plt.title('Test Set Visualization')
plt.show()

# Visualize KNN predictions
fig = plt.figure(figsize=(10, 10))
ax = plt.axes(projection='3d')
ax.scatter(comb[:, 0], comb[:, 1], comb[:, 2], c=y_pred_knn, marker='x',
           cmap='coolwarm', linewidth=1)
plt.title("Prediction from KNN")
plt.show()

print("\n\n==================== END OF ANALYSIS ====================")

