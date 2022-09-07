# Deteksi Produk
Aplikasi ditulis dengan bahasa javascript yang digunakan untuk mendeteksi produk dari input gambar, kemudian menampilkan Produk yang terdeteksi pada gambar. Proses Deteksi dilakukan menggunakan framework tesorflow js dan dalam aplikasi berbasis electron.
![Tampilan Halaman Deteksi](assets/screenshoot-1.png)
![Tampilan Hasil Deteksi](assets/screenshoot-2.png)

## Framework
- [Vue Js](https://vuejs.org)
- [Materialize CSS](https://materializecss.com/)
- [Electron Js](https://www.electronjs.org/)
- [Tensorflow Js](https://www.tensorflow.org/js/)

## Fitur
- Menampilkan bounding box dan akurasi produk yang terdeteksi
- Manampilkan harga dan banyak produk
- Menghitung total belanjaan
- Menampikan waktu yang dibutuhkan untuk proses deteksi
- Menampilkan/Menyembunyikan bounding box dari kelas produk tertentu

## Batasan aplikasi
- Hanya mendeteksi produk tertentu
- Input hanya dari file gambar
- Ukuran tampilan masih fix/statis

## Masalah / Bug yang diketahui
- Tampilan mengalami freeze saat proses deteksi
- Proses deteksi pertama kali akan sedikit lama (~4 detik lebih lama dari normal)

## Flowchart Proses Deteksi
![Tampilan Hasil Deteksi](assets/flowchart_proses_deteksi.png)

## Training Model
File Notebook yang digunakan untuk proses training model.
[object_detection_training.ipynb](https://gist.github.com/nazililham11/f65690eb39670f37cfb15793dee99bcb)


## Project setup
```
npm install
```

### Compile untuk development
```
npm run electron:serve
```

### Compile untuk production
```
npm run electron:build
```
