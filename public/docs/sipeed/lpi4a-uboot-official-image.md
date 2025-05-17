# 在 LPi4A 上安装 OpenEuler RISC-V

在 LPi4A 验证过的部署流程为：

- 板卡配置为通过 eMMC 启动
- 使用 USB fastboot 烧写 U-Boot 固件与系统

需要用到 Android SDK Platform Tools 中提供的 fastboot 工具。官方下载地址为：

[https://developer.android.com/tools/releases/platform-tools#downloads.html](https://developer.android.com/tools/releases/platform-tools#downloads.html)

## 驱动安装与配置

### Linux

需要配置 udev rules 来解决 USB 设备文件权限问题。执行下述命令完成配置：

```shell
cat << EOF | sudo tee /etc/udev/rules.d/99-thead-th1520.rules
SUBSYSTEM=="usb", ATTR{idVendor}=="2345", ATTR{idProduct}=="7654", MODE="0660", GROUP="plugdev", TAG+="uaccess"
SUBSYSTEM=="usb", ATTR{idVendor}=="1234", ATTR{idProduct}=="8888", MODE="0660", GROUP="plugdev", TAG+="uaccess"
EOF
```

执行后需要重新插拔 USB 使新规则生效。

### Windows

参考[官方文档](https://wiki.sipeed.com/hardware/zh/lichee/th1520/lpi4a/4_burn_image.html#Windows-%E4%B8%8B%E9%A9%B1%E5%8A%A8%E5%AE%89%E8%A3%85)

## 镜像烧录

根据持有的板卡 DRAM 大小选择对应的 U-Boot 固件版本并下载。

将板卡上的 Type-C 接口与电脑连接，由电脑为板卡供电。摁住 Type-C 接口旁边的 BOOT 按键同时短摁 Type-C 接口旁边的 RESET 按键，进入 BOOTROM 的下载模式后，执行：

```shell
LPI4A_RAM_VARIANT='-16g'
OERV_VERSION='24.03-LTS-SP1'

zstd -d openEuler-${OERV_VERSION}-riscv64-lpi4a-base-boot.ext4.zst
zstd -d openEuler-${OERV_VERSION}-riscv64-lpi4a-base-root.ext4.zst

fastboot flash ram u-boot-with-spl-lpi4a${LPI4A_RAM_VARIANT}.bin
fastboot reboot
sleep 1
fastboot flash uboot u-boot-with-spl-lpi4a${LPI4A_RAM_VARIANT}.bin
fastboot flash boot openEuler-${OERV_VERSION}-riscv64-lpi4a-base-boot.ext4
fastboot flash root openEuler-${OERV_VERSION}-riscv64-lpi4a-base-root.ext4
```

摁 RESET 按键重启板卡，即可进入系统。此时推荐拔下连接至电脑的 Type-C 线缆，更换为独立的电源适配器进行供电。
