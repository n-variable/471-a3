import pandas as pd

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

us_df = pd.read_csv('./data/us_w_land_use.csv')
other_df = pd.read_csv('./data/other_wo_land_use.csv')

us_df = us_df.drop(columns=columns_to_remove)
other_df = other_df.drop(columns=columns_to_remove)

max_obs_value_us = us_df.loc[us_df['OBS_VALUE'].idxmax()]

min_obs_value_per_country_other = other_df.loc[other_df.groupby('REF_AREA')['OBS_VALUE'].idxmin()]

combined_df = pd.concat([max_obs_value_us.to_frame().T, min_obs_value_per_country_other])

combined_df.to_csv('./data/black-hat-data-preprocessed.csv', index=False)