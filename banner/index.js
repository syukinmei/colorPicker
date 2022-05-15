// 上传图片相关
var input = document.getElementById("uploadfile");
const img = document.getElementById('showImg')
// 当用户上传时触发事件
input.onchange = function () {
    readFile(this);
}
//处理图片并添加都dom中的函数
var readFile = function (obj) {
    // 获取input里面的文件组
    var fileList = obj.files;
    //对文件组进行遍历，可以到控制台打印出fileList去看看
    for (var i = 0; i < fileList.length; i++) {
        var reader = new FileReader();
        reader.readAsDataURL(fileList[i]);
        // 当文件读取成功时执行的函数
        reader.onload = function (e) {
            // img.src = this.result
            // 给img外层的banner赋予渐变背景
            const banner = document.querySelector('#img-box');
            getBannerColor(this.result, banner);

        }
    }
}

// 参数为 图片的src 和 需要加渐变效果的元素
const getBannerColor = function (imgSrc, element) {
    const imgEle = document.createElement('img')
    const canvas = document.createElement('canvas')
    // const imgBox = document.querySelector('.box').appendChild(canvas)
    imgEle.src = imgSrc
    imgEle.onload = () => {
        var ctx = canvas.getContext("2d");
        var naturalImgSize = [imgEle.naturalWidth, imgEle.naturalHeight];
        canvas.width = naturalImgSize[0];
        canvas.height = naturalImgSize[1];

        // 绘制到canvas
        ctx.drawImage(imgEle, 0, 0);
        // 获取imageData：rgba像素点
        var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const leftSectionData = []
        const rightSectionData = []
        const oneLineImgDataLen = canvas.width * 4;

        imgData.data.forEach((colorVal, i) => {
            if (i % oneLineImgDataLen <= 0.5 * oneLineImgDataLen || i % oneLineImgDataLen >= 0.6 * oneLineImgDataLen) {
                const inLeft = i % oneLineImgDataLen <= 0.5 * oneLineImgDataLen
                if (i % 4 === 0) {
                    //  获取rgb均值
                    const curAverageRGB = (imgData.data[i] + imgData.data[i + 1] + imgData.data[i + 2]) / 3;
                    let leftOrRightRef = inLeft ? leftSectionData : rightSectionData;
                    // 每个数组里存四个值：本颜色值中的r、g、b的均值，以及r、g、b三个值。
                    // 均值一方面用于累加计算本区域的整体均值，然后再跟每个均值对比拿到与整体均值最接近的项的索引，再取该数组里的后三个值：rgb，对应着颜色
                    leftOrRightRef[leftOrRightRef.length] = [curAverageRGB, imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]]
                }
            }
        })
        // generate average rgb
        const averageOfLeft = Math.round(leftSectionData.reduce((_cur, item) => {
            return _cur + item[0]
        }, 0) / leftSectionData.length)
        const averageOfRight = Math.round(rightSectionData.reduce((_cur, item) => {
            return _cur + item[0]
        }, 0) / rightSectionData.length)
        // find the most near color
        const findNearestIndex = (averageVal, arrBox) => {
            let _gapValue = Math.abs(averageVal - arrBox[0])
            let _nearColorIndex = 0
            arrBox.forEach((item, index) => {
                const curGapValue = Math.abs(item - averageVal)
                if (curGapValue < _gapValue) {
                    _gapValue = curGapValue
                    _nearColorIndex = index
                }
            })
            return _nearColorIndex
        }

        const leftNearestColor = leftSectionData[findNearestIndex(averageOfLeft, leftSectionData)]
        const rightNearestColor = rightSectionData[findNearestIndex(averageOfRight, rightSectionData)]
        console.log(leftNearestColor, rightNearestColor)


        // 最好一步：取到颜色后实现元素背景渐变
        element.style.backgroundImage = `url("${imgSrc}"),linear-gradient(90deg,rgba(${leftNearestColor[1]},${leftNearestColor[2]},${leftNearestColor[3]},1) 0%,rgba(${rightNearestColor[1]},${rightNearestColor[2]},${rightNearestColor[3]},1) 100%`
        // 使用backgroundImage实现背景渐变
        element.style.backgroundPosition = 'center'
        element.style.backgroundSize = 'auto 200px'
        element.style.backgroundRepeat = 'no-repeat'
    }
}
