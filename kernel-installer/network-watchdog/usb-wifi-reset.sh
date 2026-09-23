#!/bin/sh
# Wrapper for network-watchdog USB WiFi reset. Only allows fixed device/driver.
# Allowed in sudoers so timer can run it without a password.
dev="1-7:1.2"
drv="rtw_8723du"
[ -d /sys/bus/usb/drivers/"$drv" ] || exit 0
echo "$dev" > /sys/bus/usb/drivers/"$drv"/unbind
sleep 3
echo "$dev" > /sys/bus/usb/drivers/"$drv"/bind
