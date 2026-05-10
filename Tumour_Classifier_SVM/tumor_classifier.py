"""
Tumor Classification using SVM
===============================
A machine learning project that classifies tumors as malignant or benign using
Support Vector Machines with RBF kernel.

Dataset: cancer.csv - Wisconsin Breast Cancer dataset with 30 features
Techniques Used:
- SMOTE for handling class imbalance
- Sequential Feature Selection for optimal feature selection
- SVM with RBF kernel
- ROC-AUC curve visualization

Libraries Used:
- imblearn: For synthetic oversampling of minority class
- mlxtend: For feature selection
- scikit-plot: For ROC-AUC curve visualization
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from imblearn.over_sampling import SMOTE
from mlxtend.feature_selection import SequentialFeatureSelector as SFS
import scikitplot as skplt

# =============================================================================
# DATA LOADING AND EXPLORATION
# =============================================================================

print("Loading dataset...")

# Import dataset
dataset = pd.read_csv('cancer.csv')

print("\nDataset Statistics:")
print(dataset.describe())

print("\nData Types:")
print(dataset.dtypes)

print("\nMissing Values Ratio:")
print(dataset.isnull().mean())

# =============================================================================
# DATA PREPROCESSING
# =============================================================================

print("\n\n========== DATA PREPROCESSING ==========")

# Remove 'id' column as it's not useful for prediction
print("\nDropping 'id' column...")
dataset = dataset.drop(['id'], axis='columns', inplace=False)

# Convert diagnosis column from categorical to numeric
# M (Malignant) = 1, B (Benign) = 0
print("Converting diagnosis column...")
for i in range(0, 569):
    if dataset.iloc[i, 0] == 'M':
        dataset.iloc[i, 0] = int(1)
    else:
        dataset.iloc[i, 0] = int(0)

dataset.diagnosis = pd.to_numeric(dataset['diagnosis'])

print("\nDiagnosis value counts:")
print(dataset['diagnosis'].value_counts())

# =============================================================================
# CORRELATION ANALYSIS
# =============================================================================

print("\n\n========== CORRELATION ANALYSIS ==========")

# Create correlation heatmap
print("Generating correlation heatmap...")
corr = dataset.corr()
ax = sns.heatmap(corr, vmin=-1, vmax=1, cmap="coolwarm",
                 xticklabels=dataset.columns, yticklabels=dataset.columns)
plt.title('Feature Correlation Heatmap')
plt.tight_layout()
plt.show()

# =============================================================================
# TRAIN-TEST SPLIT
# =============================================================================

print("\n\n========== SPLITTING DATA ==========")
print("Splitting data into train and test sets (70-30 split)...")

x_train, x_test, y_train, y_test = train_test_split(
    dataset.iloc[:, 1:],  # Features (all except diagnosis)
    dataset.iloc[:, 0],   # Target (diagnosis)
    test_size=0.30,
    random_state=0
)

print(f"Training set size: {x_train.shape[0]}")
print(f"Test set size: {x_test.shape[0]}")

# =============================================================================
# HANDLING CLASS IMBALANCE WITH SMOTE
# =============================================================================

print("\n\n========== HANDLING CLASS IMBALANCE ==========")
print("Applying SMOTE to balance the dataset...")

# Apply SMOTE (Synthetic Minority Oversampling Technique) to balance classes
# This generates synthetic samples for the minority class
sm = SMOTE(random_state=27, sampling_strategy=1.0)

# Resample the training data
ovx_tr, ovy_tr = sm.fit_sample(x_train, y_train)

print(f"Original training set size: {x_train.shape[0]}")
print(f"After SMOTE size: {ovx_tr.shape[0]}")
print(f"Original class distribution: {y_train.value_counts().to_dict()}")
print(f"After SMOTE class distribution: {pd.Series(ovy_tr).value_counts().to_dict()}")

# =============================================================================
# FEATURE SCALING
# =============================================================================

print("\n\n========== FEATURE SCALING ==========")
print("Standardizing features...")

# Standardize features
sc = StandardScaler()
x_train = sc.fit_transform(ovx_tr)
x_test = sc.transform(x_test)

y_train = ovy_tr

print("Features standardized successfully.")
print(f"Feature shape - Train: {x_train.shape}, Test: {x_test.shape}")

# =============================================================================
# FEATURE SELECTION
# =============================================================================

print("\n\n========== FEATURE SELECTION ==========")
print("Using Sequential Feature Selection to find optimal features...")

# Create SVM classifier for feature selection
classifier = SVC(kernel='rbf', random_state=0)

# Backward elimination to select 19 most important features
sfs1 = SFS(classifier,
           k_features=19,
           forward=False,  # Backward elimination
           floating=False,
           verbose=2,
           scoring='f1',
           cv=5)

sfs1 = sfs1.fit(x_train, y_train)

# Get selected features
selected_feat = list(sfs1.k_feature_idx_)
print(f"\nSelected feature indices: {selected_feat}")

# =============================================================================
# PREPARE SELECTED FEATURES
# =============================================================================

print("\n\n========== PREPARING DATA WITH SELECTED FEATURES ==========")

# Select only the important features from both train and test sets
x_train = x_train[:, selected_feat]
x_test = x_test[:, selected_feat]

print(f"Feature shape after selection - Train: {x_train.shape}, Test: {x_test.shape}")

# =============================================================================
# MODEL TRAINING
# =============================================================================

print("\n\n========== MODEL TRAINING ==========")
print("Training SVM model with RBF kernel...")

# Create and train SVM model
# probability=True enables predict_proba() for ROC curve
classifier = SVC(kernel='rbf', random_state=0, probability=True)

classifier.fit(x_train, y_train)

# Make predictions
y_pred = classifier.predict(x_test)
y_trpr = classifier.predict(x_train)

print("Model training completed.")

# =============================================================================
# MODEL EVALUATION
# =============================================================================

print("\n\n========== MODEL EVALUATION ==========")

# Calculate accuracy scores
train_accuracy = accuracy_score(y_train, y_trpr)
test_accuracy = accuracy_score(y_test, y_pred)

print(f"TRAIN SET ACCURACY = {train_accuracy:.4f}")
print(f"TEST SET ACCURACY = {test_accuracy:.4f}")

# Classification report for test set
print("\n_________________TEST SET__________________")
cm = confusion_matrix(y_test, y_pred)
conf_matrix = pd.DataFrame(data=cm, columns=['Predicted:0 (Benign)', 'Predicted:1 (Malignant)'],
                          index=['Actual:0 (Benign)', 'Actual:1 (Malignant)'])
plt.figure(figsize=(8, 5))
sns.heatmap(conf_matrix, annot=True, fmt='d')
plt.title('Test Set Confusion Matrix')
plt.show()
print(classification_report(y_test, y_pred))

# =============================================================================
# ROC CURVE VISUALIZATION
# =============================================================================

print("\n\n========== ROC CURVE VISUALIZATION ==========")
print("Plotting ROC curve for better analysis...")

# Get predicted probabilities for test set
y_probas = classifier.predict_proba(x_test)

# Plot ROC curve
skplt.metrics.plot_roc_curve(y_test, y_probas)
plt.title('ROC Curve - SVM Tumor Classifier')
plt.show()

# =============================================================================
# MODEL INTERPRETATION
# =============================================================================

print("\n\n========== MODEL INTERPRETATION ==========")
print(f"Accuracy: {test_accuracy:.4f}")
print("\nThe model is able to classify tumors with high accuracy.")
print("The ROC curve shows the trade-off between True Positive Rate and "
      "False Positive Rate.")

print("\n\n==================== END OF ANALYSIS ====================")

