import requests
from datetime import datetime
import pandas as pd
import time
from requests.exceptions import RequestException
from os.path import isfile

def get_match_details(session:requests.Session, base_url:str, match_id:str) -> dict[list]:
    '''
    Returns details for the match. Currently only returning scorer, time, and whether it's an own goal split by home and away. Ideally will be expanded to include all shot data.
    
    :param session: Requests Session used for making GET request
    :type session: requests.Session
    :param base_url: Base FotMob API url
    :type base_url: str
    :param match_id: ID of the match to return details for
    :type match_id: str
    :return: Dictionary of lists of dictionaries containing the scorer, time, and own goal status for all goals scored by 
    :rtype: dict[list]
    '''
    # Ensure `match_id` is a string
    if type(match_id) != str:
        match_id = str(match_id)
    try:
        resp = session.get(f'{base_url}matchDetails?matchId={match_id}')
        resp.raise_for_status()
        data = resp.json()['header']['events']
        goals = {
            'home':[],
            'away':[]
        }
        if data != None:
            for k in data['homeTeamGoals'].keys():
                for g in data['homeTeamGoals'][k]:
                    goals['home'].append({'scorer':k,'time':g['time'],'ownGoal':g['ownGoal']})
            for k in data['awayTeamGoals'].keys():
                for g in data['awayTeamGoals'][k]:
                    goals['away'].append({'scorer':k,'time':g['time'],'ownGoal':g['ownGoal']})
        return goals
    except RequestException:
        print(f'Error requesting details for id: {match_id}')
        raise


def get_init_team_fixtures(session:requests.Session, base_url:str, team_id:str) -> dict[list]:
    '''
    Docstring for get_init_team_fixtures
    
    :param session: Requests Session used for making GET request
    :type session: requests.Session
    :param base_url: Base FotMob API url
    :type base_url: str
    :param team_id: ID for team requesting (e.g '10260' for Manchester United)
    :type team_id: str
    :return: Description
    :rtype: dict[list, Any]
    '''
    # Ensure `team_id` is a string
    if type(team_id) != str:
        team_id = str(team_id)
    try:
        resp = session.get(f'{base_url}teams?id={team_id}')
        resp.raise_for_status()
        fixtures = {
            'match_id':[],
            'competition':[],
            'date':[],
            'opponent':[],
            'h_a':[]
        }
        data = resp.json()['fixtures']['allFixtures']['fixtures']
        for f in data:
            date = datetime.fromisoformat(f['status']['utcTime'][:10])
            if date > datetime.now():
                break
            fixtures['match_id'].append(f['id'])
            fixtures['competition'].append(f['tournament']['name'])
            fixtures['date'].append(date)
            if f['home']['name'] == 'Man United':
                fixtures['h_a'].append('h')
                fixtures['opponent'].append(f['away']['name'])
            else:
                fixtures['h_a'].append('a')
                fixtures['opponent'].append(f['home']['name'])
        return fixtures
    except RequestException:
        print(f'Error requesting team endpoint for {team_id}')
        raise


def get_team_fixtures(session:requests.Session, base_url:str, team_id:str, before:str=None, after:str=None) -> dict[list]:
    '''
    Docstring for get_team_fixtures
    
    :param session: Requests Session used for making GET request
    :type session: requests.Session
    :param base_url: Base FotMob API url
    :type base_url: str
    :param team_id: ID for team requesting (e.g '10260' for Manchester United)
    :type team_id: str
    :param before: Match ID of the oldest match already scraped.
    :type before: str
    '''
    # Ensure `team_id` and `before` are strings
    if type(team_id) != str:
        team_id = str(team_id)
    if before:
        if type(before) != str:
            before = str(before)
        try:
            resp = session.get(f'{base_url}pageableFixtures?teamId={team_id}&before={before}')
            resp.raise_for_status()
            data = resp.json()['matches']
            fixtures = {
                'match_id':[],
                'competition':[],
                'date':[],
                'opponent':[],
                'h_a':[]
            }
            post_ferguson = True
            for d in data:
                date = datetime.fromisoformat(d['status']['utcTime'][:10])
                if date < datetime.fromisoformat('2013-07-01'):
                    post_ferguson = False
                else:
                    fixtures['match_id'].append(d['id'])
                    fixtures['competition'].append(d['tournament']['name'])
                    fixtures['date'].append(date)
                    fixtures['opponent'].append(d['opponent']['name'])
                    if d['home']['name'] == 'Man United':
                        fixtures['h_a'].append('h')
                    else:
                        fixtures['h_a'].append('a')
            return post_ferguson, fixtures
        except RequestException:
            print(f'Error requesting fixtures for {team_id} before {before}')
            raise
    if after:
        if type(after) != str:
            after = str(after)
        try:
            resp = session.get(f'{base_url}pageableFixtures?teamId={team_id}&after={after}')
            resp.raise_for_status()
            data = resp.json()['matches']
            fixtures = {
                'match_id':[],
                'competition':[],
                'date':[],
                'opponent':[],
                'h_a':[]
            }
            post_ferguson = True
            up_to_date = False
            for d in data:
                date = datetime.fromisoformat(d['status']['utcTime'][:10])
                if date < datetime.fromisoformat('2013-07-01'):
                    post_ferguson = False
                elif date > datetime.now():
                    up_to_date = True
                    break
                else:
                    fixtures['match_id'].append(d['id'])
                    fixtures['competition'].append(d['tournament']['name'])
                    fixtures['date'].append(date)
                    fixtures['opponent'].append(d['opponent']['name'])
                    if d['home']['name'] == 'Man United':
                        fixtures['h_a'].append('h')
                    else:
                        fixtures['h_a'].append('a')
            return post_ferguson, up_to_date, fixtures
        except RequestException:
            print(f'Error requesting fixtures for {team_id} before {before}')
            raise


if __name__ == '__main__':
    # Set constants
    united_id = '10260'
    base_url = 'https://www.fotmob.com/api/data/'
    headers = {
        'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:147.0) Gecko/20100101 Firefox/147.0'
    }

    managers = [
        {'name':'Michael Carrick','from':datetime.fromisoformat('2026-01-12'),'to':datetime.now(),'type':'Interim'},
        {'name':'Darren Fletcher','from':datetime.fromisoformat('2026-01-05'),'to':datetime.fromisoformat('2026-01-12'),'type':'Caretaker'},
        {'name':'Ruben Amorim','from':datetime.fromisoformat('2024-11-11'),'to':datetime.fromisoformat('2026-01-05'),'type':'Permanent'},
        {'name':'Ruud van Nistelrooy','from':datetime.fromisoformat('2024-10-28'),'to':datetime.fromisoformat('2024-11-11'),'type':'Caretaker'},
        {'name':'Erik ten Hag','from':datetime.fromisoformat('2022-07-01'),'to':datetime.fromisoformat('2024-10-28'),'type':'Permanent'},
        {'name':'Ralf Rangnick','from':datetime.fromisoformat('2021-12-03'),'to':datetime.fromisoformat('2022-05-31'),'type':'Interim'},
        {'name':'Michael Carrick','from':datetime.fromisoformat('2021-11-21'),'to':datetime.fromisoformat('2021-12-03'),'type':'Caretaker'},
        {'name':'Ole Gunnar Solskjaer','from':datetime.fromisoformat('2019-03-28'),'to':datetime.fromisoformat('2021-11-21'),'type':'Permanent'},
        {'name':'Ole Gunnar Solskjaer','from':datetime.fromisoformat('2018-12-19'),'to':datetime.fromisoformat('2019-03-28'),'type':'Interim'},
        {'name':'José Mourinho','from':datetime.fromisoformat('2016-07-01'),'to':datetime.fromisoformat('2018-12-19'),'type':'Permanent'},
        {'name':'Louis van Gaal','from':datetime.fromisoformat('2014-07-14'),'to':datetime.fromisoformat('2016-05-24'),'type':'Permanent'},
        {'name':'Ryan Giggs','from':datetime.fromisoformat('2014-04-23'),'to':datetime.fromisoformat('2014-06-30'),'type':'Caretaker'},
        {'name':'David Moyes','from':datetime.fromisoformat('2013-07-01'),'to':datetime.fromisoformat('2014-04-23'),'type':'Permanent'}
    ]

    # Check if data already exists
    data_exists = isfile('./data/united_results_post_ferguson_latest.csv')
    if data_exists:
        results_df = pd.read_csv('./data/united_results_post_ferguson_latest.csv').drop('Unnamed: 0', axis=1).sort_values(by=['date'])
        results = results_df.to_dict('list')
        after = str(results['match_id'][-1])
        up_to_date = False
        updated = False
        with requests.Session() as s:
            s.headers.update(headers)
            while up_to_date == False:
                time.sleep(1)
                post_ferguson, up_to_date, fixtures = get_team_fixtures(s, base_url, united_id, after=after)
                if len(fixtures['match_id']) == 0:
                    print('No new data. Data files not updated.')
                else:
                    updated = True
                for i in range(len(fixtures['match_id'])):
                    time.sleep(1)
                    id = fixtures['match_id'][i]
                    h_a = fixtures['h_a'][i]
                    date = fixtures['date'][i]
                    goals = get_match_details(s, base_url, str(id))
                    if h_a == 'h':
                        gf = len(goals['home'])
                        ga = len(goals['away'])
                    else:
                        gf = len(goals['away'])
                        ga = len(goals['home'])
                    for m in managers:
                        if date >= m['from'] and date < m['to']:
                            results['manager'].append(m['name'])
                            results['manager_type'].append(m['type'])
                            break
                    results['match_id'].append(id)
                    results['competition'].append(fixtures['competition'][i])
                    results['date'].append(date)
                    results['opponent'].append(fixtures['opponent'][i])
                    results['h_a'].append(h_a)
                    results['gf'].append(gf)
                    results['ga'].append(ga)
                    results['gd'].append(gf - ga)
                # print(f'ID: {after} | Up to date: {up_to_date} | Num Fixtures: {len(fixtures['match_id'])}')
    else:
        results = {
            'match_id':[],
            'competition':[],
            'date':[],
            'manager':[],
            'manager_type':[],
            'opponent':[],
            'h_a':[],
            'gf':[],
            'ga':[],
            'gd':[]
        }
        updated = True
        with requests.Session() as s:
            # Set Headers to be used in all requests for the session
            s.headers.update(headers)

            # Get initial data based on current season
            init_fixtures = get_init_team_fixtures(s,base_url,united_id)
            for i in range(len(init_fixtures['match_id'])):
                time.sleep(1)
                id = init_fixtures['match_id'][i]
                h_a = init_fixtures['h_a'][i]
                date = init_fixtures['date'][i]
                goals = get_match_details(s, base_url, str(id))
                if h_a == 'h':
                    gf = len(goals['home'])
                    ga = len(goals['away'])
                else:
                    gf = len(goals['away'])
                    ga = len(goals['home'])
                for m in managers:
                    if date >= m['from'] and date < m['to']:
                        results['manager'].append(m['name'])
                        results['manager_type'].append(m['type'])
                        break
                results['match_id'].append(id)
                results['competition'].append(init_fixtures['competition'][i])
                results['date'].append(date)
                results['opponent'].append(init_fixtures['opponent'][i])
                results['h_a'].append(h_a)
                results['gf'].append(gf)
                results['ga'].append(ga)
                results['gd'].append(gf - ga)
            
            # Get the id for the oldest match returned and keep pulling older matches until we hit the start of the post-Fergie era (2013-07-01)
            min_id = init_fixtures['match_id'][0]
            post_ferguson = True
            while post_ferguson:
                time.sleep(1)
                post_ferguson, up_to_date, fixtures = get_team_fixtures(s, base_url, united_id, before=str(min_id))
                min_id = fixtures['match_id'][0]
                for i in range(len(fixtures['match_id'])):
                    time.sleep(1)
                    id = fixtures['match_id'][i]
                    h_a = fixtures['h_a'][i]
                    date = fixtures['date'][i]
                    goals = get_match_details(s, base_url, str(id))
                    if h_a == 'h':
                        gf = len(goals['home'])
                        ga = len(goals['away'])
                    else:
                        gf = len(goals['away'])
                        ga = len(goals['home'])
                    for m in managers:
                        if date >= m['from'] and date < m['to']:
                            results['manager'].append(m['name'])
                            results['manager_type'].append(m['type'])
                            break
                    results['match_id'].append(id)
                    results['competition'].append(fixtures['competition'][i])
                    results['date'].append(date)
                    results['opponent'].append(fixtures['opponent'][i])
                    results['h_a'].append(h_a)
                    results['gf'].append(gf)
                    results['ga'].append(ga)
                    results['gd'].append(gf - ga)
    
    # Convert dict to DataFrame and save as CSV file (latest + backup) if there are new updates
    if updated:
        df = pd.DataFrame.from_dict(results)
        df.to_csv(f'./data/united_results_post_ferguson_extracted_{datetime.now().strftime('%Y%m%d%H%M%S')}.csv')
        df.to_csv('./data/united_results_post_ferguson_latest.csv')