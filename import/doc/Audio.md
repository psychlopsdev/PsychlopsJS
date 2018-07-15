*class Psychlops::Audio*
========================

## 概要

> Audio型の実装は未確定です。
> *ブラウザ版では読み込み待ちが不完全です。現在実装しています。*


## Usage
~~~
Audio music;
music.load("sound.mp3");
music.play();
~~~

## Functions

.load(string filename)
: filename の音源ファイルを読みます。*ブラウザ版ではブラウザで再生可能な音声フォーマットに対応します。*

.play()
: 再生します。pause()していた場合はそこから再開します。

.pause()
: 中断します。

.stop()
: 再生を中止し、再生ポイントをゼロ秒に戻します。
