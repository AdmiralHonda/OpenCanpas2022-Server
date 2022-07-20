import rec_recipe_pb2_grpc
import rec_recipe_pb2
import grpc
from concurrent.futures import ThreadPoolExecutor

import yaml
import sys
import os
import numpy as np
from recommend.recommend_recipe import RecipeManeg
from recommend.user_input_assist import InputAssist,UserLikeIngredient

class RecRecipeHandle(rec_recipe_pb2_grpc.RecRecipeServicer):

    def __init__(self,n_pass: str,ing_pass: str,con_pass: str,m_pass: str,ex_pass: str,u_n_pass: str):
        self.rec_engine = RecipeManeg(self.resource_path(n_pass),self.resource_path(ing_pass),self.resource_path(con_pass))
        self.user_assist = InputAssist(self.resource_path(m_pass),self.resource_path(ex_pass))
        
        # 面倒(拙者の稼働によってデータを用意する)なのでユーザの栄養素は固定とする。
        with open(self.resource_path(u_n_pass),'r',encoding="utf-8") as f:
            import_user_nutrition = yaml.safe_load(f)
        user_nutrition = [list(nutrition.values())[0] for nutrition in import_user_nutrition["nutrition"] if nutrition.get("water") == None]
        self.user_nutrition = np.array(user_nutrition)

        super().__init__()
    
    def resource_path(self,relative_path: str) -> str:
        if hasattr(sys, '_MEIPASS'):
            return os.path.join(sys._MEIPASS, relative_path)
        return os.path.join(os.path.abspath("."), relative_path)

    def fix_name(self, request, context):
        print(request)
        resp = rec_recipe_pb2.SimQueryResp()
        
        fix_result = self.user_assist.get_sim_name(request.query)
        
        if fix_result.match:
            resp.match = True
        else:
            resp.match = False
            resp.sim_word_list.extend(fix_result.sim_word_list)
        
        return resp
    
    def get_unit_list(self, request, context):
        print(request)
        resp = rec_recipe_pb2.UnitList()

        resp.units.extend(self.user_assist.get_unit_selection(request.query))
        
        return resp
    
    def exchange_to_g(self, request, context):
        print(request)
        resp = rec_recipe_pb2.Ingredient()

        input_query = UserLikeIngredient(name=request.name,unit=request.unit,amount=request.amount)
        
        fix_result = self.user_assist.exchange_unit_to_g(input_query) # list index out of range
        
        resp.id = fix_result.id
        resp.name = fix_result.name
        resp.amount = fix_result.amount

        return resp
    
    def get_recipe(self, request, context):
        print(request)
        resp = rec_recipe_pb2.Recipe()

        """
        ユーザーに年齢や性別によって結果が違うようにごまかす処理
        ポイント:
        １．cos尺度なのでベクトル全体に対して単純な加算では距離正規化するので意味がない
        ２．性別（２択）と年齢（10,20,30,40の4択）によってベクトルの分布を変化させる
        ３．それぞれの要素毎に値の幅が違うので、基準となる栄養素ベクトルに性別と年齢によって重みをかけたものを加算する
        """
        """
        # 基準となる栄養素ベクトル
        base_nutrition_vec = self.user_nutrition
        # 性別の処理
        if sex == "man":
            np.random.seed(1)
        else:
            np.random.seed(2)

        base_nutrition_vec *= np.random.beta(30)
        # 年齢の処理
        if age < 20:
            np.random.seed(3)
        elif age < 30:
            np.random.seed(4)
        elif age < 40:
            np.random.seed(5)
        else:
            np.random.seed(6)
        base_nutrition_vec *= np.random.beta(30)

        # input_u_nutrition = self.user_nutrition + base_nutrition_vec
        """
        
        recommend_recipe_position = self.rec_engine.culuculate_sim(self.user_nutrition,request.ingredients,rec_mode=1)[0]
        recommend_recipe = self.rec_engine.get_content(recommend_recipe_position)

        resp.title = recommend_recipe["title"]
        resp.url = recommend_recipe["url"]

        return resp

def start_serve() -> None:
    server = grpc.server(ThreadPoolExecutor(max_workers=2))
    rec_handler = RecRecipeHandle("./data/recipe_nutrition_rakuten.csv",\
                                    "./data/cleaned_rakuten_recipes.json",\
                                    "./data/rakuten_content.json",\
                                    "./data/recipe_m1_v400_min_5_w3.vec.pt",\
                                    "./data/exchange.csv",\
                                    "./data/user_nutrition.yaml")
    rec_recipe_pb2_grpc.add_RecRecipeServicer_to_server(rec_handler,server)
    server.add_insecure_port("[::]:50051")
    server.start()
    server.wait_for_termination()

if __name__ == "__main__":
    start_serve()