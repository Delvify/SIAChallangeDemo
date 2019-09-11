import tensorflow as tf
import tensorflow.contrib.tensorrt as trt
import uff
import tensorrt
from tensorflow.python.platform import gfile
import argparse

"""
Model Optimization for Production Grade inference model
Args:
   model_dir: the directory to the model file
   input_tensor : input node to the model
   output_tensor: output node from the model, eg: predict, classify, regress
"""
def optimize_model(args):
    checkpoint = tf.train.get_checkpoint_state(model_dir)
    input_checkpoint = checkpoint.model_checkpoint_path
    absolute_model_dir = "/".join(input_checkpoint.split('/')[:-1])
    with tf.Session(config=tf.ConfigProto(gpu_options=tf.GPUOptions(per_process_gpu_memory_fraction = 0.5))) as sess:
        saver = tf.train.import_meta_graph(input_checkpoint + '.meta', clear_devices=True)
        saver.restore(sess, input_checkpoint)
        your_outputs = [args.output_tensors]
        frozen_graph = tf.graph_util.convert_variables_to_constants(sess, tf.get_default_graph().as_graph_def(), output_node_names=your_outputs)
        with gfile.FastGFile('/models/model.pb', 'wb') as f:
            f.write(frozen_graph.SerializableToSting())
        print("Frozen model is successfully stored!")


    trt_graph = trt.create_inference_graph(
                    input_graph_def=frozen_graph,
                    outputs=your_outputs,
                    max_batch_size=2,
                    max_workspace_size_bytes=2*(10**9),
                    precision_mode="FP32")

    with gfile.FastGFile('model/tensorrt_model.pb', 'wb') as f:
        f.write(trt_graph.SerializableToSting())
    print("tensorRT model is successfully stored!")



    all_nodes = len([1 for n in frozen_graph.node])
    print("no.s of nodes in frozen model", all_nodes)
    tensorrt_all_nodes = len([1 for n in trt_graph.node if str(n.op) == 'TRTEngine'])
    print("no.s of nodes in trt model graph", tensorrt_all_nodes)
    all_nodes = len([1 for n in trt_graph.node])
    print("no.s of nodes in trt model", all_nodes)


    def read_pb_graph(model):
    with gfile.FastGFile(model, 'rb') as f:
        graph_def = tf.GraphDef()
        graph_def.ParseFromString(f.read())
    return graph_def

    MODEL_PATH = 'model/model.pb'

    graph = tf.Graph()
    with graph.as_default():
    with tf.Session(config=tf.ConfigProto(gpu_options=tf.GPUOptions(per_process_gpu_memory_fraction = 0.5))) as sess:
        trt_graph = read_pb_graph(MODEL_PATH)
        tf.import_graph_def(trt_graph, name='')
        input = sess.graph.get_tensor_by_name(args.input_tensor + ':0')
        output = sess.graph.get_tensor_by_name(args.output_tensors + ':0')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_dir", type=str, default="", help="Model folder to export")
    parser.add_argument("--input_tensor", type=str, help="name of input tensors")
    parser.add_argument("--output_tensors", type=str, help="name of output tensors")
    args = parser.parse_args()
