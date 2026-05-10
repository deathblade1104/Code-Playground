# Customer Segmentation

An unsupervised machine learning project that segments customers in a market based on their demographics, income, and spending habits using clustering algorithms.

## 🎯 Problem Statement

Customer segmentation helps businesses understand their customer base and tailor marketing strategies for different customer groups. This project segments customers into meaningful groups based on their characteristics.

## 📊 Dataset

**File:** `Market.csv`

**Features:**
- CustomerID
- Gender
- Age
- Annual Income (INR)
- Spending Score (1-100)

## 🔧 Approach

### Algorithms Implemented
1. **Hierarchical Clustering (Agglomerative)**
   - Method: Ward linkage
   - Distance metric: Euclidean
   - Optimal clusters: 5 (determined by dendrogram)

2. **K-Means Clustering**
   - Initialization: K-means++
   - Optimal clusters: 5 (determined by elbow method)
   - Random state: 42

### Key Techniques
- Dimensionality reduction using PCA for visualization
- Elbow method for optimal cluster number
- Dendrogram analysis for hierarchical clustering
- 3D visualization of clusters
- Categorical encoding (one-hot encoding)

## 📈 Results

Both algorithms identified **5 customer segments**:

1. **Cluster 1:** High income, high spending
2. **Cluster 2:** High income, low spending
3. **Cluster 3:** Medium income, medium spending
4. **Cluster 4:** Low income, high spending
5. **Cluster 5:** Low income, low spending

## 🚀 Usage

```bash
python customer_segmentation.py
```

### Prerequisites
```bash
pip install numpy pandas matplotlib seaborn scikit-learn scipy
```

## 📁 Files

- `Market.csv` - Dataset
- `customer_segmentation.py` - Implementation with comprehensive comments
- `Customer_Segmentation.ipynb` - Jupyter notebook version
- `README.md` - This file

## 🔍 Key Insights

1. **Gender Analysis:** The market should be more oriented towards females as they visit more frequently with higher spending scores
2. **Age Analysis:** To promote sales, the mall should target customers in their late 30s and early 40s
3. **Spending Patterns:** Older customers tend to spend less
4. **Optimal Clusters:** Both hierarchical and K-means clustering found 5 clusters to be optimal
5. **Cluster Interpretation:** Different income and spending combinations identify distinct customer behaviors

## 💡 Business Applications

- Develop targeted marketing campaigns for each segment
- Optimize product placement based on customer segments
- Pricing strategies for different customer groups
- Personalize customer experience
- Identify high-value customer segments

## 🛠️ Technologies Used

- **Python**
- **NumPy, Pandas** - Data manipulation
- **Matplotlib, Seaborn** - Visualization
- **Scikit-learn** - Clustering algorithms
- **SciPy** - Hierarchical clustering
- **PCA** - Dimensionality reduction for visualization
