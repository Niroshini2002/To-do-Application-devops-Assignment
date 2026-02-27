# Set working directory
WORKDIR /usr/share/nginx/html

# Copy frontend files to Nginx's default serving directory
COPY ./src .

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]