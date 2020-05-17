import cv2
from flask import Flask, request, jsonify,render_template
import numpy as np
from fastai.transforms import tfms_from_model, CropType
from torchvision.models.resnet import resnet101
from fastai.core import V, to_np
import torch
from flask_cors import CORS
from scipy.special import expit
import base64
from http.client import HTTPException
import sys

app = Flask(__name__)

CORS(app)

model = torch.load(
    'data/models/torch.resnet101-val-loss-29.914882', map_location='cpu')
model.eval()

size = 224

trn_tfms, val_tfms = tfms_from_model(resnet101, size, crop_type=CropType.NO)
alphabet = list('abcdefghijklmnopqrstuvwxyz') + ['na']
itoa = {c: l for c, l in enumerate(alphabet)}


def bb_hw(bb):
    ymin, xmin, ymax, xmax = bb
    return np.array([xmin, ymin, xmax - xmin + 1, ymax - ymin + 1])


@app.route("/api/predict", methods=['POST','GET'])
def make_predictions():
    try:
        content = request.data
        #content = request.get_json(force=True)
        #content = format(content)
        print ('content is',format(content))
    except HTTPException as e:
        print("Inside make predictions")

        return jsonify({'error': 'Request data invalid'}), 400
    #print("RIMIIIIIIIII", content)
    content = content.decode().split(',')[1]
    print(content)
    img_str = base64.b64decode(str(content))
    print('img_str is', img_str)
    nparr = np.fromstring(img_str, np.uint8)
    print('nparr is', nparr)
    imd = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    print('imdecode is',imd)

    img = imd.astype(np.float32) / 255
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    print('image is', img)

    height, width, channels = img.shape

    im = val_tfms(img)
    output = model(V(torch.from_numpy(im[None])))
    print ("Rimiiiiiii", output)


    output = to_np(output)
    print ("Output", output)

    bb_i = expit(output[:, :4])
    y, x, y2, x2 = bb_i[0]
    bb_scaled = [
        y * height,
        x * width,
        y2 * height,
        x2 * width]
    bb_np = bb_hw(bb_scaled)

    c_i = output[:, 4:]
    print ("c_i", c_i)

    class_pred = itoa[np.argmax(c_i)]
    print ("class_pred", class_pred)
    print("list", list([int(b) for b in bb_np]))

    return jsonify({'class': class_pred, 'bb': list([int(b) for b in bb_np])})


@app.route('/')
def hello_world():
    return render_template('index.html')


if __name__ == '__main__':
    print("This is main")
    app.run(debug=True, port=5007)
