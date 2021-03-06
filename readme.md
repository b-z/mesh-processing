# 使用说明

1. 整体界面如图，左侧为绘制区域，右侧为控制区域，点击INFO等可展开面板;  
   ![](img/0.png)

2. 点击右上角，读取obj或off模型文件;  
   ![](img/1.png)

3. 绘制区域中央出现了bunny;  
   ![](img/2.png)

4. 展开INFO面板可查看网格信息;  
   ![](img/3.png)

5. 在VIEW面板中可以切换显示模式;  
   ![](img/4.png)

6. 比如现在从默认的smooth切换到了flat。如果模型的面片数很少，那么开始加载的时候就会直接切到flat模式;  
   ![](img/5.png)

7. 然后显示wireframe并隐藏掉mesh;  
   ![](img/6.png)

8. 鼠标左键可以旋转视角;  
   ![](img/7.png)

9. 在COLOR区域设置颜色映射，右侧竖条是预览。这里还可以上传颜色表、切换映射模式、自定义映射;  
   ![](img/8.png)

10. 让我们把模式切成离散颜色。由于没有读入颜色表，我默认地以面片编号作为颜色数值，然后就变成了这样;  
   ![](img/9.png)

11. 接下来读一下颜色表，这回可以有规律地着色了;  
   ![](img/14.png)

12. 默认的颜色表是这三个，上图就是使用第三个来着色的。连续颜色模式看起来过渡很自然，因为用了Lab颜色空间来做插值;  
   ![](img/12.png)![](img/11.png)![](img/10.png)

13. 程序的强大之处在于它可以自定义颜色映射，三种模式都可以自定义。点击Color Edit按钮就可以弹出下图的弹框。具体怎么用看右边使用说明;  
   ![](img/32.png)

14. 比如我设计了一个这样的颜色映射:  
   ```javascript
      [
        [0, [0, 0, 128]],
        [0.15, [0, 0, 255]],
        [0.382, [50, 255, 255]],
        [0.5, [128, 255, 128]],
        [0.618, [255, 255, 50]],
        [0.85, [255, 0, 0]],
        [1, [128, 0, 0]]
      ]
   ```  

15. 预览条:  
    ![](img/33.png)

16. 模型变成了这样;  
    ![](img/34.png)

17. 接下来是各个查找功能，它们位于FIND面板;  
    ![](img/15.png)

18. 查找一个顶点的相邻点，为了显示效果，这些用于标示的球体的半径是根据边长计算的。可以使用鼠标右键拖动绘图区来平移视角，滚轮滚动来缩放;  
    ![](img/16.png)

19. 查找一个顶点的相邻面;  
    ![](img/17.png)

20. 查找一个面的相邻面;  
    ![](img/18.png)

21. 然后是绘制区域、法向量功能，这些功能位于DRAW面板。输入的各个编号之间分隔符可以为空格、逗号、正斜杠、分号;  
    ![](img/19.png)

22. 绘制区域;  
    ![](img/20.png)

23. 也可以把mesh隐藏掉，只看这个区域;  
    ![](img/21.png)

24. 绘制法线;  
    ![](img/22.png)

25. 如果输入区域留空则绘制全部法线;  
    ![](img/23.png)

26. 犹他茶壶的全部法线;  
    ![](img/24.png)

27. 我选了第一个选做题目，相关功能位于NOISE面板;  
    ![](img/27.png)

28. 我们尝试为上一步的茶壶生成$\sigma=0.03$的高斯噪声，蓝色的为生成的结果，位于原mesh内部的部分被消隐掉了，可以隐藏掉mesh来查看;  
    ![](img/25.png)

29. 实验发现，当滤波使用的$\sigma$是噪声$\sigma$二倍的时候平滑效果较好，因此生成噪声的时候默认在下面填入了$2\sigma=0.06$。接下来点击Filter进行滤波，得到下图。红色的即为滤波后的模型。该步骤同时计算了滤波后模型与原始模型的差异，并绘制了出来;  
    ![](img/26.png)

30. 现在单独查看滤波后的模型;  
    ![](img/28.png)

31. 现在单独查看滤波后的模型;  
    ![](img/31.png)

32. 单独查看差异对比。这里同样使用了颜色映射(不同的是这次是对顶点着色)，暖色是凸出来的，冷色是凹进去的。为了增强显示效果，我放大了模型的差异(使用了平方根函数)。由这个图也可以看出来，噪声+滤波之后得到的模型会去除原模型中较为尖锐的部分。  
    ![](img/29.png)
