import re
import requests
import base64

API_KEY = "4b8e72a9deee98d2626a36ca21a42e404abe5ff10854a79f8727983217aa3b05"

def harmful_links_detector(text):

    urls = re.findall(r'https?://\S+', text)

    if not urls:
        return {"label": "no_link", "confidence": 100}

    for url in urls:

        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")

        endpoint = f"https://www.virustotal.com/api/v3/urls/{url_id}"

        headers = {"x-apikey": API_KEY}

        response = requests.get(endpoint, headers=headers)

        data = response.json()

        stats = data.get("data", {}).get("attributes", {}).get("last_analysis_stats")

        if not stats:
            return {"label": "unknown_link", "confidence": 50}

        malicious = stats.get("malicious", 0)

        if malicious > 0:
            return {"label": "malicious_link", "confidence": 95}

    return {"label": "safe_link", "confidence": 80}