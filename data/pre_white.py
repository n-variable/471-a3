import pandas as pd

df = pd.read_csv('./data/white-hat-data.csv')

columns_to_remove = [
    'STRUCTURE', 
    'STRUCTURE_ID', 
    'STRUCTURE_NAME', 
    'OBS_STATUS', 
    'Observation status', 
    'BASE_PER', 
    'Base period', 
    'PRICE_BASE', 
    'Price base', 
    'ACTION', 
    'FREQ', 
    'Frequency of observation', 
    'Time period',
    'Observation value',
    'Unit multiplier',
    'Decimals',
    'Unit of measure',
    'MEASURE',
    'Measure',
    'CONVERSION_TYPE',
    'Conversion type',
    'UNIT_MEASURE',
    'Pollutant'
]
df.drop(columns=columns_to_remove, inplace=True)

df.to_csv('./data/white-hat-data-preprocessed.csv', index=False)
