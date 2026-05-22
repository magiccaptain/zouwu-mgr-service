#Linux API加密算法环境变量设置
#建议将以下几个环境变量加入启动程序用户.bash_profile中 vim ~/.bash_profile
#具体目录请用户根据自己放的so位置自行修改
cur_path=("$(dirname "$0")")
export ATP_ENCRYPT_PASSWORD=$cur_path/librsa_2048_encrypt.so
export RSA_PUBLIC_KEY_PATH=$cur_path/rsa_public_key.pem
echo "ATP_ENCRYPT_PASSWORD=" $ATP_ENCRYPT_PASSWORD
