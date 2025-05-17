# 在 Milk-V Pioneer 上安装由 LinuxBoot 引导的 openEuler RISC-V

Pioneer 位于 NOR Flash 上的出厂固件存在多个可能的版本，其中具有一些较老的版本存在与新内核的兼容性问题。因此 OERV 镜像发布时附带了验证过的对应固件版本，一并进行发布。（协议许可？）

由于 SG2042 的 BootROM 逻辑会优先从 SD 卡加载固件，因此本文档利用该特性实施如下部署方案：

- 在 microSD 部署验证过的基于 LinuxBoot 的固件
- 将系统镜像部署至 M.2 NVME SSD上

## 部署固件至 SD 卡

下载 `sg2042_firmware_linuxboot.img.zip` ，解压得到 `sg2042_firmware_linuxboot.img`。

将该镜像恢复到 microSD 卡中。使用 `dd` 命令如下：

```shell
MICROSD_DEV="/dev/sdX"
sudo dd if=sg2042_firmware_linuxboot.img of="${MICROSD_DEV}" bs=512k conv=sync status=progress oflag=direct
sudo eject "${MICROSD_DEV}"
```

将 `sdX` 替换为实际的 SD 卡块设备路径。

或使用图形化的工具例如：

- gnome-disks
- [balenaEtcher](https://etcher.balena.io/#download-etcher)

## 部署系统镜像至 M.2 NVME SSD

下载文件列表中提供的 `openEuler-xx.xx-XXXXXX-riscv64-sg2042.img.zip` ，解压得到 `openEuler-xx.xx-XXXXXX-riscv64-sg2042.img` 。

将该镜像恢复到 SSD 中：

```shell
OERV_VERSION="24.03-LTS-SP1"
SSD_DEV="/dev/sdX"
sudo dd if="openEuler-${OERV_VERSION}-riscv64-sg2042.img" of="${SSD_DEV}" bs=512k conv=sync status=progress oflag=direct
sudo eject "${SSD_DEV}"
```

按需修改 `OERV_VERSION` 与 `SSD_DEV` 为实际值。

## 启动系统

将 SD 卡与 M.2 SSD 插回 Pioneer 上，上电启动。

当进入 OERV 内核后，串口的打印会随 earlycon 停止，后续的 console 会由外接的显卡输出。

## 备注

LinuxBoot 提供了一个 GRUB 的兼容实现，因此内核与系统的引导配置与 GRUB 类似。没有使用 `extlinux.conf` 。
