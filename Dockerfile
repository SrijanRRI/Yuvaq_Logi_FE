FROM node:18 AS build

ENV PORT=85
ENV NODE_OPTIONS="--max-old-space-size=1024"


WORKDIR /app
COPY package.json /app/
COPY package-lock.json /app/

# Clean npm cache and force esbuild rebuild
RUN npm cache clean --force
RUN npm install --legacy-peer-deps
RUN npm rebuild esbuild

COPY . /app/

# Build the application
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx.conf to replace default nginx.conf
COPY ./nginx.conf /etc/nginx/nginx.conf

EXPOSE ${PORT}

CMD ["nginx", "-g", "daemon off;"]


# docker build  --no-cache -t 192.168.13.72:5000/logiq_fe_17_feb .      
# docker run -d --name logiq_fe_17_feb -p 85:85 logiq_fe_image

# docker tag logiq_fe_image 192.168.13.72:5000/logiq_fe_17_feb
# docker push 192.168.13.72:5000/logiq_fe_17_feb
# docker pull 192.168.13.72:5000/logiq_fe_17_feb
# docker run -d --name logiq_fe_17_feb -p 85:85 192.168.13.72:5000/logiq_fe_17_feb


# docker pull 192.168.13.72:5000/rrcomplaint_frontend
# docker run -d --name rrcomplaint_frontend -p 85:85 192.168.13.72:5000/rrcomplaint_frontend