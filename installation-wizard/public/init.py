import os
import stat
import shutil

service_dst = '/etc/systemd/system/solar-controller.service'
symlink_dst = '/etc/systemd/system/multi-user.target.wants/solar-controller.service'

# move files to the root system
shutil.copy('/boot/solar-controller.service', service_dst)
if not os.path.isfile(symlink_dst):
    os.symlink(service_dst, symlink_dst)
shutil.copy('/boot/solar-controller', '/bin/solar-controller')
# make solar-controller binary executable
st = os.stat('/bin/solar-controller')
os.chmod('/bin/solar-controller', st.st_mode | stat.S_IEXEC)
os.makedirs('/var/lib/solar-controller/', exist_ok=True)

# remove init= from cmdline.txt
