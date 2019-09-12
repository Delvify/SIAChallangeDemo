import argparse

from flask import Flask, render_template
from flask import request
from numpy import dot
from numpy.linalg import norm
from flask_cors import CORS
import json
import os
from flask.json import jsonify
from gevent import monkey
monkey.patch_all()
from gevent import pywsgi
import operator


app = Flask(__name__)
cors = CORS(app, resources={r"/computeSimilarity" : {"origins": "*"}})


global item_sentenceEmbedding


@app.route("/")
def main(args):
    '''
    Main Function -> this is the point where program starts \n
    :return: Returns nothing
    '''
    global item_sentenceEmbedding
    item_sentenceEmbedding = getSentenceEmbeddingAllItem(args)
    return render_template("index.html")


@app.route("/about")
def about():
    '''
    To Check if the serving is up and running.
    :return:
    '''
    return "About"


def getItemDescription():
    pass


def read_catalog(args):
    '''
      Reads the catalog file of items as an input \n
      :param: Input File path \n
      :returns: the dictionary of key (sku) and values (description)
    '''
    item_dictionary = dict()
    # catalog_filePath = args.catalog  # "/home/jugs/PycharmProjects/DelvifyFWD/web/resources/DataFeedInterfloraProductFeed.json"
    catalog_filePath = "/home/jugs/PycharmProjects/DelvifyFWD/CatalogPreprocessor/rawJson/DataFeedYOINS.json"
    with open(catalog_filePath, "r") as catalog_file:
        data = json.load(catalog_file)
    for line in data:
        sku = line["SKU"]
        name = line["Name"]
        category = line["Category"]
        description = line["Description"]
        if len(description) < 50:
            pass
        item_dictionary[sku] = category + ". " + name + ". " + description
    return item_dictionary


def connection():
    '''
    Pass the sql connection string and login/authorization credential \n
    :return: Returns the connection Object
    '''
    conn = "mysql connection"
    return conn

@app.before_first_request
def getSentenceEmbeddingAllItem(args):
    '''
     This function generates the sentence embedding fot a given list of string \n
    :return: dictionary of key as sku and value as sentence_embedding
    '''
    app.logger.info("Running Application Once!")
    bc = get_bertClient()
    items_dict = read_catalog(args)
    description_embeddings = bc.encode(list(items_dict.values()))
    i = 0
    for key, value in items_dict.items():
        items_dict[key] = description_embeddings[i]
        i = i + 1
    return items_dict


def getSentenceEmbeddingQuery():
    return str


def cos_sim(a, b):
    '''
    Takes in two numpy array as it's parameter,
    and returns the cosine similarity of two vector(numpy)
    :param a: numpy array
    :param b: numpy array
    :return: cosine similarity score (scalar quantity) with a given equation
    '''
    return dot(a, b)/(norm(a)*norm(b))


def computeSimilarityScore(queryEmbededing):
    '''
    Takes the input parameters as the sentence embedding that was returned from the
    bert_client which was hosted from the server. And, uses the globally declared
    variable (list of sentence embedding). Then generates the list of scores by
    computing the similarity between user input and corpus.
    :param queryEmbededing:
    :return: list of score with user query and data corpus.
    '''
    global item_sentenceEmbedding
    scores = dict()
    # queryEmbededing = np.transpose(queryEmbededing)
    for key, value in item_sentenceEmbedding.items():
        score_val = cos_sim(queryEmbededing[0], value)
        scores[key] = score_val
    return dict(sorted(scores.items(), reverse=True, key=operator.itemgetter(1)))


def get_top_n():
    # return top n similar items as that of input query
    return


def getQueryEmbedding(query):
    '''
    Takes in the string/user response as an input, process with the bert_client,
    to generate the sentence embedding of the given input
    :param query: String value (input sentence)
    :return: sentence embedding tensor
    '''
    bc = get_bertClient()
    query_embedding = bc.encode(query)
    return query_embedding

@app.route('/computeSimilarity')   # , methods=['GET', 'POST'])
def computeSimilarity():
    score = dict()
    # usertext = request.get_data()
    usertext = request.args.get('text')
    # query_txt = usertext.decode('utf-8')
    query_lst = list()
    query_lst.append(usertext)
    query_embed = getQueryEmbedding(query_lst)
    score = computeSimilarityScore(query_embed)
    topn_skus = get_topn_items(score)
    # score = [423, 456, 766, 123, 345, 343, 867, 642, 702, 703, 771, 775, 780]
    return jsonify({'skus':topn_skus})         # str(usertext) + "Delvify"


def get_topn_items(item_dict, n =30):
    skus = list()
    i = 0
    for key, value in item_dict.items():
        if i <= n:
            skus.append(key)
            i = i + 1
    return skus


if __name__ == "__main__":
    global item_sentenceEmbedding
    parser = argparse.ArgumentParser(description="Argument Parser to parse an arguments")
    parser.add_argument('--catalog', type=str, help="catalog file path")
    args = parser.parse_args()
    try:
        server = pywsgi.WSGIServer(('0.0.0.0', 5001), app)
        server.serve_forever("curl http://0.0.0.0:5000")
        if True:
            os.system('curl http://0.0.0.0:5001')
    except KeyboardInterrupt:
        print("closed")
    # app.run(debug=True, host="0.0.0.0")


#  curl http://13.67.xxx.xx:8085/computeSimilarity?text=your%20seearch%20query

