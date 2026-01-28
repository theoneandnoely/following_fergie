import requests
from datetime import datetime
import pandas as pd

UNITED_ID = 10260
GRIMSBY_ID = '4927193'
CITY_ID = '4813590'
LEEDS_ID = '4759293'
FULHAM_ID = '4813391'
test_id = '4506348'
base_url = f'https://www.fotmob.com/api/data/matchDetails?matchId={FULHAM_ID}'

matches_url = f'https://www.fotmob.com/api/data/pageableFixtures?teamId={UNITED_ID}&before={test_id}'
headers = {
    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0'
}

with requests.Session() as s:
    s.headers.update(headers)
    resp = s.get(matches_url)
    if resp.status_code == 200:
        for m in resp.json()['matches']:
            print(f'ID: {m['id']} | Date: {datetime.fromisoformat(m['status']['utcTime'][:10])} | Opponent: {m['opponent']['name']}')
        # print(resp.json()['header']['events'])
        # home = resp.json()['header']['events']['homeTeamGoals']
        # away = resp.json()['header']['events']['awayTeamGoals']
        # home_goals = 0
        # away_goals = 0
        # for k in home.keys():
        #     home_goals += len(home[k])
        #     for g in home[k]:
        #         if g['ownGoal']:
        #             print(f'{k} (OG) {g['time']}\'')
        #         else:
        #             print(f'{k} {g['time']}\'')
        # for k in away.keys():
        #     away_goals += len(away[k])
        #     for g in away[k]:
        #         if g['ownGoal']:
        #             print(f'{k} (OG) {g['time']}\'')
        #         else:
        #             print(f'{k} {g['time']}\'')
        # print(f'Score: {home_goals} - {away_goals}')
        # print(resp.json()['header']['events']['awayTeamGoals'].keys())
    else:
        print(resp)