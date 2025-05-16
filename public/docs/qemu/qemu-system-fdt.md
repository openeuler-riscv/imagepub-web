# 在 QEMU system-mode 运行 openEuler RISC-V

本文档基于使用设备树的 qcow2 镜像编写。

需要 QEMU v8.2 以上版本。

## 下载

下载下列 EDKII 固件:

- `RISCV_VIRT_CODE.fd`
- `RISCV_VIRT_VARS.fd`

下载系统镜像 `openEuler-xx.xx-xxxxxx-riscv64.qcow2.xz` 并解压得到 `openEuler-xx.xx-xxxxxx-riscv64.qcow2`。

将上述三个文件放在同一目录下。

## 启动

执行下述命令：

```shell
OERV_VERSION="24.03-LTS"
VCPU_NUM=4
VMEM_SIZE_NUMA1=4
VMEM_SIZE_NUMA2=4
PORTMAP_SSH=12055

qemu-system-riscv64 \
  -nographic -machine virt,pflash0=pflash0,pflash1=pflash1,acpi=off \
  -smp "${VCPU_NUM}" -m "$(( ${VMEM_SIZE_NUMA1} + ${VMEM_SIZE_NUMA2} ))G" \
  -object memory-backend-ram,size=${VMEM_SIZE_NUMA1}G,id=ram1 \
  -numa node,memdev=ram1 \
  -object memory-backend-ram,size=${VMEM_SIZE_NUMA2}G,id=ram2 \
  -numa node,memdev=ram2 \
  -blockdev node-name=pflash0,driver=file,read-only=on,filename="RISCV_VIRT_CODE.fd" \
  -blockdev node-name=pflash1,driver=file,filename="RISCV_VIRT_VARS.fd" \
  -drive file="openEuler-${OERV_VERSION}-riscv64.qcow2",format=qcow2,id=hd0,if=none \
  -object rng-random,filename=/dev/urandom,id=rng0 \
  -device virtio-vga \
  -device virtio-rng-device,rng=rng0 \
  -device virtio-blk-device,drive=hd0,bootindex=1 \
  -device virtio-net-device,netdev=usernet \
  -netdev user,id=usernet,hostfwd=tcp::"${PORTMAP_SSH}"-:22 \
  -device qemu-xhci -usb -device usb-kbd -device usb-tablet
```

默认用户名： `root`

默认密码： `openEuler12#$`

对于 `24.03-LTS-SP1` 及以后版本，可以不提供 numa 内存配置，使用下述命令：

```shell
OERV_VERSION="24.03-LTS-SP1"
VCPU_NUM=4
VMEM_SIZE=8
PORTMAP_SSH=12055

qemu-system-riscv64 \
  -nographic -machine virt,pflash0=pflash0,pflash1=pflash1,acpi=off \
  -smp "${VCPU_NUM}" -m "${VMEM_SIZE}G" \
  -blockdev node-name=pflash0,driver=file,read-only=on,filename="RISCV_VIRT_CODE.fd" \
  -blockdev node-name=pflash1,driver=file,filename="RISCV_VIRT_VARS.fd" \
  -drive file="openEuler-${OERV_VERSION}-riscv64.qcow2",format=qcow2,id=hd0,if=none \
  -object rng-random,filename=/dev/urandom,id=rng0 \
  -device virtio-vga \
  -device virtio-rng-device,rng=rng0 \
  -device virtio-blk-device,drive=hd0,bootindex=1 \
  -device virtio-net-device,netdev=usernet \
  -netdev user,id=usernet,hostfwd=tcp::"${PORTMAP_SSH}"-:22 \
  -device qemu-xhci -usb -device usb-kbd -device usb-tablet
```
