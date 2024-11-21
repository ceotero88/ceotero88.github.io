from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.base import BaseEstimator, ClassifierMixin
import pandas as pd
import numpy as np

class UserPredictor(BaseEstimator, ClassifierMixin):
    def __init__(self):
        """Initialize the predictive model with scaling and logistic regression using L1 penalty."""
        self.model = Pipeline([
            ('scaler', StandardScaler()),
            ('log_reg', LogisticRegression(C=0.5, penalty='l1', solver='saga'))  # L1 penalty with SAGA solver
        ])

    def fit(self, X_users, X_logs, y):
        """Fit the model using user and log data. Prepare features and fit the logistic regression model."""
        data = self.prepare_features(X_users, X_logs)
        self.model.fit(data, y['clicked'])

    def predict(self, X_users, X_logs):
        """Predict whether users will click the email based on prepared features."""
        data = self.prepare_features(X_users, X_logs)
        return self.model.predict(data)
    
    def prepare_features(self, X_users, X_logs):
        """Prepare and return features for modeling, including URL-based features."""
        features = X_users[['id', 'past_purchase_amt']].copy()
        
        #analyze URL visits
        X_logs['product_type'] = X_logs['url'].apply(lambda x: x.split('/')[-1].split('.')[0])
        url_features = pd.get_dummies(X_logs['product_type']).groupby(X_logs['id']).sum()
        
        #time and log data features
        log_summary = X_logs.groupby('id').agg({
            'duration': ['sum', 'mean', 'std', 'min', 'max'],
            'url': 'count'
        })
        log_summary.columns = ['_'.join(col).strip() for col in log_summary.columns.values]
        log_summary.reset_index(inplace=True)
        
        data = pd.merge(features, log_summary, on='id', how='left')
        data = pd.merge(data, url_features, on='id', how='left').fillna(0)
        return data

if __name__ == "__main__":
    predictor = UserPredictor()
    train_users = pd.read_csv('data/train_users.csv')
    train_logs = pd.read_csv('data/train_logs.csv')
    train_clicked = pd.read_csv('data/train_clicked.csv')
    predictor.fit(train_users, train_logs, train_clicked)
