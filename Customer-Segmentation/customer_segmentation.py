"""
Customer Segmentation
=====================
An unsupervised machine learning project that segments customers in a market based on their
spending habits, age, gender, and annual income using clustering algorithms.

Dataset: Market.csv - Customer data with demographics and spending scores
Algorithms Used:
- Hierarchical Clustering (Agglomerative)
- K-Means Clustering
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.decomposition import PCA
from sklearn.cluster import AgglomerativeClustering, KMeans
import scipy.cluster.hierarchy as sch
from mpl_toolkits import mplot3d

# =============================================================================
# DATA LOADING AND PREPROCESSING
# =============================================================================

print("Loading dataset...")
dataset = pd.read_csv("Market.csv")

# Display dataset info
print("\nDataset Info:")
dataset.info()

# Drop CustomerID as it's not useful for clustering
dataset = dataset.drop(['CustomerID'], axis=1, inplace=False)

# Check for missing values
print("\nMissing values:")
print(dataset.isnull().sum())

# Rename columns for better readability
dataset = dataset.rename(columns={'Annual Income\n(INR)': 'Income',
                                  'Spending Score (1-100)': 'Score'})

print("\nDataset preview:")
print(dataset.head())

# Convert categorical variables to dummy variables
dataset = pd.get_dummies(dataset, drop_first=True)

print("\nAfter one-hot encoding:")
print(dataset.head())

# =============================================================================
# EXPLORATORY DATA ANALYSIS
# =============================================================================

print("\n\n========== EXPLORATORY DATA ANALYSIS ==========")

# Analyze spending score by gender
print("\nAnalyzing spending score by gender...")
sns.set_style('darkgrid')
sns.set()

Female = dataset[dataset['Gender_Male'] == 0]
Male = dataset[dataset['Gender_Male'] == 1]

sns.distplot(Female.Score, label='Female', color='grey')
sns.distplot(Male.Score, label='Male', color='lightgreen')
plt.legend(title='Gender', loc='best')
plt.show()

print("Inference: The market should be more oriented towards females, as the "
      "number of females visiting the market is higher, and their scores "
      "are more spread out than males.")

# Analyze age vs spending score
print("\nAnalyzing age vs spending score...")
fig, ax = plt.subplots(figsize=(10, 8))
sns.set_palette('YlGnBu')
sns.axes_style("whitegrid")
sns.scatterplot(x='Age', y='Score', data=dataset, ax=ax)
sns.lineplot(x='Age', y='Score', data=dataset, markers="o", ax=ax)
plt.show()

print("Inference: To promote sales, the mall could target customers in their "
      "late 30s and early 40s. Customers who are older tend to spend less.")

# =============================================================================
# DIMENSIONALITY REDUCTION WITH PCA
# =============================================================================

print("\n\n========== APPLYING PCA FOR VISUALIZATION ==========")

# Apply PCA to reduce dimensions for visualization
pca = PCA(n_components=3)
pca.fit(dataset)
X = pca.transform(dataset)

print(f"Explained variance ratio: {pca.explained_variance_ratio_}")
print(f"Total explained variance: {sum(pca.explained_variance_ratio_):.4f}")

# =============================================================================
# HIERARCHICAL CLUSTERING
# =============================================================================

print("\n\n========== HIERARCHICAL CLUSTERING ==========")

# Create dendrogram to find optimal number of clusters
print("Creating dendrogram...")
dendrogram = sch.dendrogram(sch.linkage(dataset, method='ward'))
plt.title('Dendrogram')
plt.xlabel('Customers')
plt.ylabel('Euclidean distances')
plt.show()

print("Inference: From the dendrogram, it can be seen that 5 is the optimal "
      "number of clusters for this dataset.")

# Apply Hierarchical Clustering
print("\nApplying Hierarchical Clustering with 5 clusters...")
hc = AgglomerativeClustering(n_clusters=5, affinity='euclidean', linkage='ward')
dataset['label_hc'] = hc.fit_predict(dataset)

# Visualize Hierarchical Clustering results
print("Visualizing Hierarchical Clustering results...")
df = pd.DataFrame(dataset)
fig = plt.figure(figsize=(15, 15))
ax = plt.axes(projection='3d')

# Plot each cluster in 3D
ax.scatter(X[:, 0][df.label_hc == 0], X[:, 1][df.label_hc == 0],
           X[:, 2][df.label_hc == 0], c='blue', s=100, label='Cluster 1')
ax.scatter(X[:, 0][df.label_hc == 1], X[:, 1][df.label_hc == 1],
           X[:, 2][df.label_hc == 1], c='red', s=100, label='Cluster 2')
ax.scatter(X[:, 0][df.label_hc == 2], X[:, 1][df.label_hc == 2],
           X[:, 2][df.label_hc == 2], c='green', s=100, label='Cluster 3')
ax.scatter(X[:, 0][df.label_hc == 3], X[:, 1][df.label_hc == 3],
           X[:, 2][df.label_hc == 3], c='orange', s=100, label='Cluster 4')
ax.scatter(X[:, 0][df.label_hc == 4], X[:, 1][df.label_hc == 4],
           X[:, 2][df.label_hc == 4], c='purple', s=100, label='Cluster 5')

sns.set_style('darkgrid')
sns.set_context("talk")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
ax.set_zlabel("Principal Component 3")
plt.legend()
plt.show()

# =============================================================================
# K-MEANS CLUSTERING
# =============================================================================

print("\n\n========== K-MEANS CLUSTERING ==========")

print("Applying elbow method to find optimal number of clusters...")

# Calculate WCSS (Within-Cluster Sum of Squares) for different k values
wcss = []
for i in range(1, 11):
    kmeans = KMeans(n_clusters=i, init='k-means++', random_state=42)
    # Fit on data excluding the hierarchical clustering label
    kmeans.fit(dataset.iloc[:, :-1])
    wcss.append(kmeans.inertia_)

# Plot the elbow curve
plt.figure(figsize=(10, 5))
plt.plot(range(1, 11), wcss, linewidth=2, color="Blue", marker="x")
plt.title('The Elbow Method')
plt.xlabel('Number of clusters')
plt.xticks(np.arange(1, 11, 1))
plt.ylabel('WCSS')
plt.show()

print("Inference: The optimal number of clusters according to the Elbow "
      "Method is 5.")

# Apply K-Means with optimal number of clusters
print("\nApplying K-Means Clustering with 5 clusters...")
kmeans = KMeans(n_clusters=5, init='k-means++', random_state=42)
dataset['label_kmc'] = kmeans.fit_predict(dataset.iloc[:, :-1])

# Visualize K-Means Clustering results
print("Visualizing K-Means Clustering results...")
df = pd.DataFrame(dataset)
fig = plt.figure(figsize=(15, 15))
ax = plt.axes(projection='3d')

# Plot each cluster in 3D
ax.scatter(X[:, 0][df.label_kmc == 0], X[:, 1][df.label_kmc == 0],
           X[:, 2][df.label_kmc == 0], c='blue', s=100, label='Cluster 1')
ax.scatter(X[:, 0][df.label_kmc == 1], X[:, 1][df.label_kmc == 1],
           X[:, 2][df.label_kmc == 1], c='red', s=100, label='Cluster 2')
ax.scatter(X[:, 0][df.label_kmc == 2], X[:, 1][df.label_kmc == 2],
           X[:, 2][df.label_kmc == 2], c='green', s=100, label='Cluster 3')
ax.scatter(X[:, 0][df.label_kmc == 3], X[:, 1][df.label_kmc == 3],
           X[:, 2][df.label_kmc == 3], c='orange', s=100, label='Cluster 4')
ax.scatter(X[:, 0][df.label_kmc == 4], X[:, 1][df.label_kmc == 4],
           X[:, 2][df.label_kmc == 4], c='purple', s=100, label='Cluster 5')

sns.set_style('darkgrid')
sns.set_context("talk")
plt.xlabel("Principal Component 1")
plt.ylabel("Principal Component 2")
ax.set_zlabel("Principal Component 3")
plt.legend()
plt.show()

# =============================================================================
# RESULTS COMPARISON
# =============================================================================

print("\n\n========== RESULTS COMPARISON ==========")
print("\nCluster assignments comparison:")
print(dataset.iloc[:, -2:])  # Show both clustering results

print("\n\nConclusion:")
print("Both Hierarchical and K-Means clustering found the optimum number of "
      "clusters to be 5.")
print("With Hierarchical Clustering, we always end up with the same labels "
      "for our data, whereas K-Means may produce different labels due to "
      "random initialization.")
print("Even though both algorithms gave 5 clusters, the labels weren't "
      "exactly the same.")

print("\n\n==================== END OF ANALYSIS ====================")

