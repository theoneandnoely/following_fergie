import pandas as pd
# Import Data
df = pd.read_csv('./data/united_results_post_ferguson_latest.csv',index_col=1).drop('Unnamed: 0', axis=1)
# Sort By Match Date
df = df.sort_values(by=['date'])
# Remove Friendlies and Pre-season Competitions
df = df[df['competition'] != 'Club Friendlies']
df = df[df['competition'].str.contains('Champions Cup') == False]
# Original data has incosistent names for the same competition (e.g. EFL Cup and League Cup, and Qualification, Group, and Final Stages as separate competitions)
# Map the FotMob competitions to consistent competition and stage (i.e. quals, league/group, and knockout) label
competitions = {
    'Community Shield':{'trophy':'Community Shield', 'stage':'knockout'},
    'Premier League':{'trophy':'Premier League', 'stage':'league'},
    'Champions League':{'trophy':'Champions League', 'stage':'league'},
    'Champions League Qualification':{'trophy':'Champions League', 'stage':'qualification'},
    'Champions League Final Stage':{'trophy':'Champions League', 'stage':'knockout'},
    'League Cup':{'trophy':'League Cup', 'stage':'knockout'},
    'EFL Cup':{'trophy':'League Cup', 'stage':'knockout'},
    'FA Cup':{'trophy':'FA Cup', 'stage':'knockout'},
    'Europa League':{'trophy':'Europa League', 'stage':'league'},
    'Europa League Final Stage':{'trophy':'Europa League', 'stage':'knockout'},
    'UEFA Super Cup':{'trophy': 'UEFA Super Cup', 'stage':'knockout'}
}
df['trophy'] = df['competition'].apply(lambda x: competitions[x]['trophy'])
df['stage'] = df['competition'].apply(lambda x: competitions[x]['stage'])
# Add Manager GD and Cumulative GD
df['manager_gd'] = df.groupby(['manager'])['gd'].cumsum()
df['cum_gd'] = df['gd'].cumsum()
# Reorder columns and rename trophy to competition
df = df[['trophy','stage','date','manager','manager_type','opponent','h_a','gf','ga','gd','manager_gd','cum_gd']]
df.rename({'trophy':'competition'}, axis=1, inplace=True)
# Export as CSV
df.to_csv('./data/united_competitive_results_post_ferguson.csv')