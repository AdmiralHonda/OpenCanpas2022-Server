import pandas as pd
from gensim.models import KeyedVectors

from pydantic import BaseModel
from typing import List, Dict, Optional

class SimQueryresp(BaseModel):
    match : bool
    sim_word_list : Optional[List[str]] = []

class UserLikeIngredients(BaseModel):
    name : str
    unit : str
    amount : float

class InputAssist():

    def __init__(self, model_pass: str,exchange_list_pass: str) -> None:
        
        self.word_model = KeyedVectors.load_word2vec_format(model_pass, binary=True)
        self.exchange = pd.read_csv(exchange_list_pass,names=["id","name","option","unit","amount"])

    def exchange_unit_to_g(self,user_ingredients: List[UserLikeIngredients]) -> Dict[str,float]:
        resp = {}

        for ingredient in user_ingredients:
            search = self.exchange.query('name == "{}" and unit == "{}"'.format(ingredient.name,ingredient.unit))
            resp[str(search[0:1]["id"].to_list()[0])] = float(search[0:1].amount) * ingredient.amount
        
        return resp

    def get_sim_name(self, query: str) -> SimQueryresp:        
        resp = SimQueryresp(match=False)
        search_list = set(self.exchange["name"].values)

        # クエリがそもそも認識してたらTrueにして返す
        if query in search_list:
            resp.match = True
            return resp
        try:
            sim_list = self.word_model.most_similar(positive=[query])
            for sim_word in sim_list:
                if sim_word[0] in search_list:
                    resp.sim_word_list.append(sim_word[0])
        except KeyError:
            pass

        return resp
    
    def get_unit_selection(self, query: str) -> List[str]:
        resp = self.exchange.query('name == "{}"'.format(query))
        return list(set(resp["unit"].to_list()))

if __name__ == "__main__":
    assister = InputAssist("../data/recipe_m1_v400_min_5_w3.vec.pt","../data/exchange.csv")
    print(assister.get_sim_name("きゅうり"))
    print(assister.get_unit_selection("きゅうり"))
    ttmp = {"name": "きゅうり","unit":"本","amount":1.}
    tmp = UserLikeIngredients(**ttmp)

    print(assister.exchange_unit_to_g([tmp]))
