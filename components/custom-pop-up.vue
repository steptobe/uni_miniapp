<template>
	<view class="cu-modal" :class="value ?'show':''">
		<view class="cu-dialog" style="border-radius: 16rpx;">
			<view v-if="title" class="cu-bar justify-between" style="background-color: #fafbfb;height: 120rpx;padding: 0 30rpx;box-sizing: border-box;">
				<view class="action" style="margin-left: 0;">{{ title }}</view>
				<view class="flex justify-center align-center" style="height: 100%;" @click="hideModal">
					<!-- <image style="width: 32rpx;height: 32rpx;" class="margin-right" src="/static/close.svg" mode="widthFix"></image> -->
				</view>
			</view>
			<view class="padding-lg bg-white">
				<slot></slot>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: ['value', 'title'],
		data() {
			return {
				
			};
		},
		methods: {
			hideModal() {
				this.$emit('input', !this.value);
			}
		}
	}
</script>

<style lang="scss" scoped>
/* ==================
         模态窗口
 ==================== */

.cu-modal {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 1110;
	opacity: 0;
	outline: 0;
	text-align: center;
	-ms-transform: scale(1.185);
	transform: scale(1.185);
	backface-visibility: hidden;
	perspective: 2000upx;
	background: rgba(0, 0, 0, 0.6);
	transition: all 0.3s ease-in-out 0s;
	pointer-events: none;
}

.cu-modal::before {
	content: "\200B";
	display: inline-block;
	height: 100%;
	vertical-align: middle;
}

.cu-modal.show {
	opacity: 1;
	transition-duration: 0.3s;
	-ms-transform: scale(1);
	transform: scale(1);
	overflow-x: hidden;
	overflow-y: auto;
	pointer-events: auto;
}

.cu-dialog {
	position: relative;
	display: inline-block;
	vertical-align: middle;
	margin-left: auto;
	margin-right: auto;
	width: 680upx;
	max-width: 100%;
	background-color: #f8f8f8;
	border-radius: 10upx;
	overflow: hidden;
}

.cu-modal .cu-dialog>.cu-bar:first-child .action{
  min-width: 100rpx;
  margin-right: 0;
  min-height: 100rpx;
}

</style>
