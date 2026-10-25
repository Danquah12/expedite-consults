import requests
import sys
import urllib3
from bs4 import BeautifulSoup
import jwt
import base64

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'}

def get_csrf_token(s, url):
    r = s.get(url, verify=False, proxies=proxies)
    soup = BeautifulSoup(r.text, 'html.parser')
    csrf = soup.find('input', {'name': 'csrf'})['value']
    return csrf

def login(url, s, username, password):
    login_url = url + '/login'
    csrf_token = get_csrf_token(s, login_url)
    print("(+) Logging in as the user " + username + "....")
    login_params = {'csrf': csrf_token, 'username': username, 'password': password}
    r = s.post(login_url, data=login_params, verify=False, proxies=proxies, allow_redirects=False)
    if r.status_code == 302:
        print("(+) Login is successful.")
        jwt_token = r.cookies['session']
        return jwt_token
    else:
        print("(-) Login not successful.")
        sys.exit(-1)

def jwt_sig_verifiction_attack(url, token):
    # TODO: implement weak signing key attack
    pass

if __name__ == '__main__':
    if len(sys.argv) != 4:
        print('Usage: python jwt-attacks-lab-02.py <target_url> <username> <password>')
        sys.exit(1)
    target = sys.argv[1]
    user = sys.argv[2]
    passwd = sys.argv[3]
    s = requests.session()
    token = login(target, s, user, passwd)
    print('Obtained JWT:', token)
    jwt_sig_verifiction_attack(target, token)
