export const x = [
'{ for i in 1 2 3 4 5 6; do echo "user=mira src=203.0.113.14 result=fail"; done; for i in 1 2; do echo "user=root src=198.51.100.7 result=fail"; done; echo "user=dev src=192.0.2.55 result=fail"; echo "user=mira src=203.0.113.14 result=ok"; } > ~/auth.log; grep "result=fail" ~/auth.log | cut -d" " -f2 | sort | uniq -c | sort -nr'
];
