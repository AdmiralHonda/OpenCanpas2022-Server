from cgi import test
import grpc
import rec_recipe_pb2
import rec_recipe_pb2_grpc

channel = grpc.insecure_channel('localhost:50051')
rec_recipe_client = rec_recipe_pb2_grpc.RecRecipeStub(channel)

"""
fix_nameのテスト
食材名の表記揺れを解消し、入力データをシステムで扱える形式にする
"""
test_query = rec_recipe_pb2.Query()

# 正常ケース（既にサーバ側で認識されている食材名）
test_query.query = "きゅうり"
test_query_result = rec_recipe_client.fix_name(test_query)
print("fix_name(きゅうり) ->",\
        "\ntype(match)=",type(test_query_result.match),\
        "\nmatch=",test_query_result.match,
        "\ntype(sim_word_list)=",type(test_query_result.sim_word_list),\
        "\nsim_word_list=",test_query_result.sim_word_list,"\n")

# 正常ケース（サーバで認識できない）
test_query.query = "うんこ"
test_query_result = rec_recipe_client.fix_name(test_query)
print("fix_name(うんこ) ->",\
        "\ntype(match)=",type(test_query_result.match),\
        "\nmatch=",test_query_result.match,
        "\ntype(sim_word_list)=",type(test_query_result.sim_word_list),\
        "\nsim_word_list=",test_query_result.sim_word_list,"\n")


"""
get_unit_listのテスト

"""
test_query = rec_recipe_pb2.Query()
test_query.query = "きゅうり"

test_query_result = rec_recipe_client.get_unit_list(test_query)
print("get_unit_list(きゅうり) ->",\
        "\ntype(units)=",type(test_query_result.units),\
        "\nunits=",test_query_result.units,"\n")

"""
exchange_to_gのテスト
"""
test_query = rec_recipe_pb2.UserLikeIngredients()
test_query.name = "たまねぎ"
test_query.unit = "個"
test_query.amount = 1.

test_query_result = rec_recipe_client.exchange_to_g(test_query)
print("get_unit_list({たまねぎ,個,1.}) ->",\
        "\ntype(id)=",type(test_query_result.id),\
        "\nid=",test_query_result.id,\
        "\ntype(name)=",type(test_query_result),\
        "\nname=",test_query_result.name,\
        "\ntype(amount)=",type(test_query_result.amount),\
        "\namount=",test_query_result.amount,"\n")

"""
get_recipeのテスト
"""
# ユーザデータの読み込み
import json

with open("./data/user_profile.json","r",encoding="utf-8") as f:
    tmp = json.load(f)
tmp = tmp["first"]

test_query = rec_recipe_pb2.Ingredients()

tmp_ingre = {}

for ingre in tmp.items():
        test_query.ingredients[ingre[0]] = ingre[1] / 4.0


test_query_result = rec_recipe_client.get_recipe(test_query)

print("get_recipe() ->",\
        "\ntype(title)=",type(test_query_result.title),\
        "\ntitle=",test_query_result.title,
        "\ntype(url)=",type(test_query_result.url),\
        "\nurl=",test_query_result.url,"\n")