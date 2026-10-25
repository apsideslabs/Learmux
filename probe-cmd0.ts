export const x = [
'printf "web1:10.0.0.11:8080\\\\nweb2:10.0.0.12:8080\\\\ndb1:10.0.0.21:5432\\\\n" > ~/servers.txt; awk -F: \\\'{print $2}\\\' ~/servers.txt'
];
