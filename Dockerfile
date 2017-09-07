FROM portainer/base



VOLUME /data

WORKDIR /

EXPOSE 9000

ENTRYPOINT ["/portainer"]
