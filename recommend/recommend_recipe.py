import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import math
import pandas as pd
import json

from pydantic import BaseModel

class Recipe(BaseModel):
    title : str
    url  : str

class RecipeManeg():

    def __init__(self,nutrition_list_pass : str,ingredients_list_pass : str,content_list_pass : str):

        # 栄養素データcsvの読み込み
        tmp = pd.read_csv(nutrition_list_pass)

        self.nutrition_list = tmp[["kcal","prot",\
                                "chole","fat","fib","polyl","na","k","ca","mg","p","fe","zn","cu","mn",\
                                "iodine","se","cr","mo","vitd","vitk","thla","ribf","nia","vitb12","fol",\
                                "pantac","biot","vitc"]].values # idと水を除外して行列に
        
        # 各レシピの食材データjsonの読み込み
        with open(ingredients_list_pass,"r",encoding="utf-8") as f:
            un_taken_recipe_ingredients = json.load(f)
        self.recipe_ingredients_list = {}

        # レシピから水を排除
        for recipe in un_taken_recipe_ingredients.items():
            insert_recipe = {}
            for ingre in recipe[1].items():
                if ingre[0] == "1055":
                    pass
                else:
                    insert_recipe[ingre[0]] = ingre[1]
            self.recipe_ingredients_list[recipe[0]] = insert_recipe
        
        self.recipe_key_list = list(self.recipe_ingredients_list)

        # 推薦されるコンテンツの読み込み
        with open(content_list_pass,"r",encoding="utf-8") as f:
            self.recipe_list = json.load(f)

    def culuculate_sim(self, user_nutrition : np.ndarray, user_ingredients : dict, rec_mode : int) -> tuple :
        """
        戻り値の構造
        ( 推薦コンテンツの添え字: int , 食材ベクトルの類似度: float, 栄養素ベクトルの類似度: float,動作モード: int)
        動作モードについて
            0 -> 食材と栄養素を用いた推薦 
            1 -> 食材のみの推薦
            2 -> 栄養素のみ推薦
        """
         # 栄養素ベクトルとの類似度の算出
        nutrition_sim = cosine_similarity([user_nutrition], self.nutrition_list)[0]

        if rec_mode == 2:
            return (np.argmax(nutrition_sim), 0.0, np.max(nutrition_sim), rec_mode)
        
        # 食材ベクトルとの類似度の算出
        ingredients_sim = []

        #　ユーザーベクトルの距離算出のために各要素の２乗を計算
        search_vec_distance = 0
        for ingredient in user_ingredients.items():
            search_vec_distance += ingredient[1] ** 2


        for recipe in self.recipe_ingredients_list.items():
            
            match_ingre_list = []
            innor_pro = 0
            content_vec_distance = 0

            for ingredient in recipe[1].items():
                
                if ingredient[0] in user_ingredients:
                    content_vec_distance += ingredient[1] ** 2
                    match_ingre_list.append(ingredient[0])
                    innor_pro += ingredient[1] * user_ingredients[ingredient[0]]
            
            if len(match_ingre_list) == 0:
                ingredients_sim.append(0.0)
            else:
                ingredients_sim.append(innor_pro/ (math.sqrt(search_vec_distance) * math.sqrt(content_vec_distance) ))

        if rec_mode == 1:
            return (np.argmax(ingredients_sim), np.max(ingredients_sim), 0.0, rec_mode)
        
        rec_position = np.argmax(nutrition_sim * ingredients_sim)
        return (rec_position, ingredients_sim[rec_position],nutrition_sim[rec_position])

    def get_id(self, rec_positon: int) -> str:
        return self.recipe_key_list[rec_positon]
    
    def get_content(self, rec_position: int) -> Recipe:
        return self.recipe_list[self.get_id(rec_position)]