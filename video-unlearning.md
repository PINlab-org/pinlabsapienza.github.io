---
layout: video-unlearning
title: Video Unlearning via Low-Rank Refusal Vector
description: "Video Unlearning via Low-Rank Refusal Vector"
venue: arXiv preprint
authors: Simone Facchiano, Stefano Saravalle, Matteo Migliarini, Edoardo De Matteis, Alessio Sampieri, Andrea Pilzer, Emanuele Rodolà, Indro Spinelli, Luca Franco, Fabio Galasso
paper: https://arxiv.org/pdf/2506.07891
code: https://github.com/4idrossifenil-etanammide/Video-Unlearning
citekey: facchiano2026video
teaser: /assets/img/projects/video-unlearning/teaser.png
teaser_alt: Video Unlearning teaser
abstract: >-
  Video generative models democratize the creation of visual content through intuitive instruction following, but they also inherit the biases and harmful concepts embedded within their web-scale training data. This inheritance creates a significant risk, as users can readily generate undesirable and even illegal content. This work introduces the first unlearning technique tailored explicitly for video diffusion models to address this critical issue. Our method requires 5 multi-modal prompt pairs only. Each pair contains a “safe” and an “unsafe” example that differ only by the target concept. Averaging their per-layer latent differences produces a “refusal vector”, which, once subtracted from the model parameters, neutralizes the unsafe concept. We introduce a novel low-rank factorization approach on the covariance difference of embeddings that yields robust refusal vectors. This isolates the target concept while minimizing collateral unlearning of other semantics, thus preserving the visual quality of the generated video. Our method preserves the model’s generation quality while operating without retraining or access to the original training data. By embedding the refusal direction directly into the model’s weights, the suppression mechanism becomes inherently more robust against adversarial bypass attempts compared to surface-level input-output filters. In a thorough qualitative and quantitative evaluation, we show that we can neutralize a variety of harmful contents, including explicit nudity, graphic violence, copyrights, and trademarks.
---
