#!/bin/bash
find /app/content -type f \( -name "*.yaml" -o -name "*.json" \) | sort
curl -s -X POST http://localhost:8000/api/v1/auth/login -H "Content-Type: application/json" -d '{"alias": "alumno1", "password": "demo1234"}'
echo ""
curl -s -X POST http://localhost:8000/api/v1/auth/register -H "Content-Type: application/json" -d '{"alias": "test_user2", "password": "test1234", "classroom_code": "RIQCHARIY-DEMO"}'
echo ""
