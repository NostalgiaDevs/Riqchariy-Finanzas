import urllib.request
import json

def test_endpoint(url, data):
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'})
    try:
        response = urllib.request.urlopen(req)
        print(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print(e.read().decode('utf-8'))

print("Login:")
test_endpoint("http://localhost:8000/api/v1/auth/login", {"alias": "alumno1", "password": "demo1234"})
print("Register:")
test_endpoint("http://localhost:8000/api/v1/auth/register", {"alias": "test_user", "password": "test1234", "classroom_code": "RIQCHARIY-DEMO"})
