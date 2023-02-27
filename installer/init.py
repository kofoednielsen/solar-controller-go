import os
import stat

service_dst = '/etc/systemd/system/solar-controller.service'
symlink_dst = '/etc/systemd/system/multi-user.target.wants/solar-controller.service'

# move files to the root system
os.replace('/boot/soler-controller.service', service_dst)
if not os.path.isfile(symlink_dst):
    os.symlink(service_dst, symlink_dst)
os.replace('/boot/soler-controller', '/bin/solar-controller')
# make solar-controller binary executable
st = os.stat('/bin/solar-controller')
os.chmod('/bin/solar-controller', st.st_mode | stat.S_IEXEC)
os.mkdirs('/var/lib/solar-controller/', exists_ok=True)

# remove init= from cmdline.txt
