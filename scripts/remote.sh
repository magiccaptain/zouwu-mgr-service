ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC7eAfYpQCjlqJ5ksYd0XlPYv+y1ZK0VE3PRIgMVm7FuQOWcDe/m2WGZzegKDmJsU/4hZ1CWwMDoOK0HQeIzGnY+J9DP1e2U9DiE3iN1727wtEljHi853QGKwwcuWOwTNS0gSGhHf1yk95ir5HpyIzW8BiOCJY7DrffamaGsiLkmeHIb9na3DlGqfMgi1k+eFXvljmmCjayfD7lpXfNfPWktiKNzScJyaDL1cbLzwhAdUhzmCGJZNJiGX+Jh0laDK9tJO4zNtW7wFVe6NuasZl2m98MKa6A7vdbTD+i4ebEC9b1YzlwFaCPNiY1KphyafQpN8QR0zUT/FJ2moqjUpBAAYNXoCWAaPN9dBS3cpqf42jMtjd17t1vuOCU3QbN5ixL0spnEXIW2g4VYgm50PrFoDii8A1E+qD7Kn85uwpHfrp9gaZPYnvT+RAsHtMucE17Y9bwyHyRatVoU62zQG3aXW+qhAcuWEUaP3o0e/RItCs2nvxGaKdTuIoTiUOpFOBw+gVNdoesh4/viQdrAe+0MJqWdG8Gw2i7fzF8344wqpYuVkYcJD2IKGu8YHRWnoZROinGU1NBMYMf6N3J3lAaMxQi4L+uonPDZzJ8t/BpvkRlLwthe1zX42tWCFzRFvo6RAy62FTlHgJBYBgakoacmkuGR43zlCLrnk31tg6c1Q== magic@DESKTOP-4JOGCKM

# 建立反代

# 中泰 12710
autossh -M 11104 -fCNR 12709:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12710:localhost:12709 localhost

# 中泰 12730
autossh -M 11104 -fCNR 12729:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12730:localhost:12729 localhost

# 中泰 12706
autossh -M 11104 -fCNR 12705:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12706:localhost:12705 localhost

# 中泰 12712
autossh -M 11104 -fCNR 12711:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12712:localhost:12711 localhost

# 中泰 12752
autossh -M 11104 -fCNR 12751:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12752:localhost:12751 localhost

# 中泰 12760
autossh -M 11104 -fCNR 12759:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12760:localhost:12759 localhost

# 中泰 12703
autossh -M 11104 -fCNR 12702:localhost:22 -i /home/admin/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12703:localhost:12702 localhost


# 中金 12772
autossh -M 11104 -fCNR 12771:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12772:localhost:12771 localhost

# 中金 12774
autossh -M 11104 -fCNR 12773:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12774:localhost:12773 localhost

# 中金 12776
autossh -M 11104 -fCNR 12775:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12776:localhost:12775 localhost

# 中金 12778
autossh -M 11104 -fCNR 12777:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12778:localhost:12777 localhost

# 中金 12780
autossh -M 11104 -fCNR 12779:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12780:localhost:12779 localhost

# 中金 12782
autossh -M 11104 -fCNR 12781:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12782:localhost:12781 localhost

# 国信 12732 
autossh -M 11104 -fCNR 12731:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12732:localhost:12731 localhost

# 国信 12734
autossh -M 11104 -fCNR 12733:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12734:localhost:12733 localhost

# 国信 12740
autossh -M 11104 -fCNR 12739:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12740:localhost:12739 localhost


# 国信 12742
autossh -M 11104 -fCNR 12741:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12742:localhost:12741 localhost

# 国信 12736
autossh -M 11104 -fCNR 12735:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12736:localhost:12735 localhost

# 国信 12744
autossh -M 11104 -fCNR 12743:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12744:localhost:12743 localhost


# 国君 12762
autossh -M 11104 -fCNR 12761:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12762:localhost:12761 localhost

# 国君 12722
autossh -M 11104 -fCNR 12721:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12722:localhost:12721 localhost

# 国君 12766
autossh -M 11104 -fCNR 12765:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12766:localhost:12765 localhost

# 国君 12724
autossh -M 11104 -fCNR 12723:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12724:localhost:12723 localhost

# 国君 12726
autossh -M 11104 -fCNR 12725:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12726:localhost:12725 localhost


# 国君 12764
autossh -M 11104 -fCNR 12763:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12764:localhost:12763 localhost


# 中金eq 12802
autossh -M 11104 -fCNR 12801:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12802:localhost:12801 localhost

# 中金eq 12804
autossh -M 11104 -fCNR 12803:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12804:localhost:12803 localhost

# 方正 12812
autossh -M 11104 -fCNR 12811:localhost:22 -i /home/zszb/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12812:localhost:12811 localhost

# 方正 12814
autossh -M 11104 -fCNR 12813:localhost:22 -i /home/zszb/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12814:localhost:12813 localhost

# 方正 12816
autossh -M 11104 -fCNR 12815:localhost:22 -i /home/zszb/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12816:localhost:12815 localhost


# 招商 12822
ssh -fCNR 12821:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12822:localhost:12821 localhost

# 招商 12824
ssh -fCNR 12823:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12824:localhost:12823 localhost

# 招商 12826
ssh -fCNR 12825:localhost:22 -i /root/.ssh/id_rsa \
-o "ServerAliveInterval 10" \
-p 12704 root@47.101.149.192

ssh -fCNL *:12826:localhost:12825 localhost

