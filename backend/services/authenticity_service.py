import json
from pathlib import Path

class AuthenticityService:
    def __init__(self):
        self.data_path = Path(__file__).parent.parent / "data" / "craft_rules.json"
        self.craft_rules = self._load_rules()

    def _load_rules(self):
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []

    def check_violations(self, message: str):
        violations = []
        for craft in self.craft_rules:
            if craft["id"].lower() in message.lower() or craft["name"].lower() in message.lower():
                for red_line in craft["red_lines"]:
                    if red_line["keyword"].lower() in message.lower():
                        violations.append({
                            "craft": craft["name"],
                            "warning": red_line["warning"],
                            "alternatives": craft["can_personalize"],
                            "time": craft["estimated_time"]
                        })
        return violations
