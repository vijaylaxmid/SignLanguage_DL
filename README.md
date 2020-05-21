# Sign Language Detector

## Introduction

Hand gesture is one of the methods used in sign language for non-verbal communication. It is essentially used by people with hearing or speech impairments to communicate among themselves and with others. However, to communicate using hand gestures, knowledge of the sign language is necessary. We are seeking to create a system that will automatically identify the hand gestures and convert its meaning into text. This will enable anyone to communicate better even without the explicit knowledge of sign language. This could prove beneficial especially in emergency situations. The project is trained on AUSLAN dataset which is the Australian version of the sign language. It is composed by using gestures with both the hands. To train the model, we collected the images from a YouTube video of the AUSLAN signs. A CNN model was trained on this dataset. For the demo, a client application was built with Python Flask framework that captures a live video and posts the video frame to a backend server application that runs the trained CNN model to generate the caption.

## Working Demo

The live demo of our app is under docs folder in the repository.

## Setup

-   `conda create -n myenv python=3.6`
-   `conda activate myenv`
-   `pip install opencv-python xmltodict requests`
-   `pip install torchvision fastai==0.6`
-   `pip install flask`
-   `pip install flask_cors`
