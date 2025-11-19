import json
import boto3
import gspread
from oauth2client.service_account import ServiceAccountCredentials

def get_gspread_client(secret_name='gspread-service-account', region='us-east-1'):
    sm = boto3.client('secretsmanager', region_name=region)
    secret = sm.get_secret_value(SecretId=secret_name)
    sa_json = json.loads(secret['SecretString'])

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive"
    ]

    creds = ServiceAccountCredentials.from_json_keyfile_dict(sa_json, scopes)
    client = gspread.authorize(creds)
    return client
