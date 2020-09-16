# multiple-package-publish

## 功能介绍

1. 多包发布，替代不好用的 lerna
2. 对当前多包目录进行统一发布或者取消发布
3. 需要搭配 `multipl-package-build` 当前工程
2. warning:开发完成待验证

## 安装

``` 
yarn add multiple-package-publish 
//or 
npm install multiple-package-publish 
```

## 使用   

``` ts
import { publish,unpublish } from 'multiple-package-publish'

async function(){
    await publish({tag?:'beta||rc',target?:'packageRelativeDir'}?)
    await unpublish({version:'1.0.0'})
}

```

## cli模式

``` shell
npm i -g multiple-package-publish
multiple-package-publish   publish|unpublish
// or 
mpp publish |unpublish
```

 
