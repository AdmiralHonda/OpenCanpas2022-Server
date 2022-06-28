import pandas as pd
from gensim.models import KeyedVectors

from pydantic import BaseModel
from typing import List, Optional

class SimQueryresp(BaseModel):
    match : bool
    sim_word_list : Optional[List[str]] = []

class UserLikeIngredient(BaseModel):
    name : str
    unit : str
    amount : float

class FixedIngredient(BaseModel):
    id: str
    name: str
    amount: float

class InputAssist():

    def __init__(self, model_pass: str,exchange_list_pass: str) -> None:
        self.word_model = KeyedVectors.load_word2vec_format(model_pass, binary=True)
        self.exchange = pd.read_csv(exchange_list_pass,names=["id","name","option","unit","amount"])

    def exchange_unit_to_g(self,user_ingredient: UserLikeIngredient) -> FixedIngredient:
        resp = FixedIngredient(id="",name="",amount=0.)
        search = self.exchange.query('name == "{}" and unit == "{}"'.format(user_ingredient.name,user_ingredient.unit))
        
        if search.empty:
            return resp
        resp.id = str(search[0:1]["id"].to_list()[0])
        resp.name = str(search[0:1]["name"].to_list()[0])
        resp.amount = float(search[0:1].amount) * user_ingredient.amount
        
        return resp

    def get_sim_name(self, query: str) -> SimQueryresp:        
        resp = SimQueryresp(match=False)
        search_list = set(self.exchange["name"].values)

        # クエリがそもそも認識してたらTrueてにし返す
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
    
    tmp = UserLikeIngredient(name="たまねぎ",unit="個",amount=1.)
    print(assister.exchange_unit_to_g(tmp))
