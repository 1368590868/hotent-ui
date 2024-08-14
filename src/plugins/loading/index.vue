<template>
  <div>
    <van-overlay
      :show="isShow"
      :custom-style="{
        background: 'rgb(0, 0, 0, 0.2)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 5000
      }"
    >
      <van-loading size="24px" :color="color || '#409eff'">
        <span :style="{color: color || '#409eff'}">{{ title || '加载中···' }}</span>
      </van-loading>
    </van-overlay>
  </div>
</template>